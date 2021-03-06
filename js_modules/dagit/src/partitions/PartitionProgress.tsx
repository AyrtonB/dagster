import {gql, NetworkStatus, useQuery} from '@apollo/client';
import {Tooltip} from '@blueprintjs/core';
import qs from 'qs';
import * as React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {PythonErrorInfo} from 'src/PythonErrorInfo';
import {stringFromValue, TokenizingFieldValue} from 'src/TokenizingField';
import {PartitionProgressQuery} from 'src/partitions/types/PartitionProgressQuery';
import {IRunStatus, RunStatusDot} from 'src/runs/RunStatusDots';
import {
  failedStatuses,
  inProgressStatuses,
  queuedStatuses,
  successStatuses,
} from 'src/runs/RunStatuses';
import {POLL_INTERVAL} from 'src/runs/useCursorPaginatedQuery';
import {useCountdown} from 'src/ui/Countdown';
import {Group} from 'src/ui/Group';
import {RefreshableCountdown} from 'src/ui/RefreshableCountdown';
import {RepoAddress} from 'src/workspace/types';
import {workspacePathFromAddress} from 'src/workspace/workspacePath';
interface Props {
  pipelineName: string;
  repoAddress: RepoAddress;
  runTags: TokenizingFieldValue[];
}

export const PartitionProgress = (props: Props) => {
  const {pipelineName, repoAddress, runTags} = props;
  const tags = runTags.map((token) => {
    const [key, value] = token.value.split('=');
    return {key, value};
  });
  const [shouldPoll, setShouldPoll] = React.useState(true);

  const {data, networkStatus, refetch} = useQuery<PartitionProgressQuery>(
    PARTITION_PROGRESS_QUERY,
    {
      fetchPolicy: 'network-only',
      pollInterval: shouldPoll ? POLL_INTERVAL : undefined,
      notifyOnNetworkStatusChange: true,
      variables: {
        filter: {pipelineName, tags},
        limit: 100000,
      },
    },
  );

  const countdownStatus = networkStatus === NetworkStatus.ready ? 'counting' : 'idle';
  const timeRemaining = useCountdown({
    duration: POLL_INTERVAL,
    status: countdownStatus,
  });
  const countdownRefreshing = countdownStatus === 'idle' || timeRemaining === 0;

  const results = React.useMemo(() => {
    if (!data || !data?.pipelineRunsOrError) {
      return null;
    }

    const runs = data.pipelineRunsOrError;
    if (runs.__typename === 'InvalidPipelineRunsFilterError' || runs.__typename === 'PythonError') {
      return null;
    }

    const total = runs.results.length;
    const {queued, inProgress, succeeded, failed} = runs.results.reduce(
      (accum, {status}) => {
        return {
          queued: accum.queued + (queuedStatuses.has(status) ? 1 : 0),
          inProgress: accum.inProgress + (inProgressStatuses.has(status) ? 1 : 0),
          succeeded: accum.succeeded + (successStatuses.has(status) ? 1 : 0),
          failed: accum.failed + (failedStatuses.has(status) ? 1 : 0),
        };
      },
      {queued: 0, inProgress: 0, succeeded: 0, failed: 0},
    );
    return {queued, inProgress, succeeded, failed, total};
  }, [data]);

  React.useEffect(() => {
    if (results) {
      const {total, succeeded, failed} = results;
      setShouldPoll(total !== succeeded + failed);
    }
  }, [results]);

  if (!results) {
    return <div />;
  }

  const {queued, inProgress, succeeded, failed, total} = results;
  const finished = succeeded + failed;

  const table = (
    <TooltipTable>
      <tbody>
        <TooltipTableRow runStatus="QUEUED" humanText="Queued" count={queued} total={total} />
        <TooltipTableRow
          runStatus="STARTED"
          humanText="In progress"
          count={inProgress}
          total={total}
        />
        <TooltipTableRow
          runStatus="SUCCESS"
          humanText="Succeeded"
          count={succeeded}
          total={total}
        />
        <TooltipTableRow runStatus="FAILURE" humanText="Failed" count={failed} total={total} />
      </tbody>
    </TooltipTable>
  );

  return (
    <Group direction="row" spacing={8}>
      <div style={{fontVariantNumeric: 'tabular-nums'}}>
        <Tooltip content={table}>
          <Link
            to={workspacePathFromAddress(
              repoAddress,
              `/pipelines/${pipelineName}/runs?${qs.stringify({q: stringFromValue(runTags)})}`,
            )}
          >
            {finished}/{total} runs
          </Link>
        </Tooltip>{' '}
        done ({((finished / total) * 100).toFixed(1)}%)
      </div>
      {shouldPoll ? (
        <RefreshableCountdown
          refreshing={countdownRefreshing}
          seconds={Math.floor(timeRemaining / 1000)}
          onRefresh={() => refetch()}
        />
      ) : null}
    </Group>
  );
};

const TooltipTableRow: React.FC<{
  runStatus: IRunStatus;
  humanText: string;
  count: number;
  total: number;
}> = ({runStatus, humanText, count, total}) => {
  if (!count) {
    return null;
  }

  return (
    <tr>
      <td>
        <Group direction="row" spacing={8} alignItems="center">
          <RunStatusDot status={runStatus} size={10} />
          <div>{humanText}</div>
        </Group>
      </td>
      <td>
        {count}/{total}
      </td>
    </tr>
  );
};

const TooltipTable = styled.table`
  border-spacing: 0;
  td {
    font-variant-numeric: tabular-nums;
  }
  td:first-child {
    width: 120px;
  }
  td:last-child {
    text-align: right;
  }
`;

const PARTITION_PROGRESS_QUERY = gql`
  query PartitionProgressQuery($filter: PipelineRunsFilter!, $limit: Int) {
    pipelineRunsOrError(filter: $filter, limit: $limit) {
      ... on PipelineRuns {
        results {
          id
          status
        }
      }
      ... on InvalidPipelineRunsFilterError {
        message
      }
      ... on PythonError {
        ...PythonErrorFragment
      }
    }
  }
  ${PythonErrorInfo.fragments.PythonErrorFragment}
`;
