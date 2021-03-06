import {gql, useQuery} from '@apollo/client';
import {Button, ButtonGroup, Colors, Icon, InputGroup} from '@blueprintjs/core';
import React from 'react';
import {useHistory} from 'react-router';
import {Link} from 'react-router-dom';
import styled from 'styled-components/macro';

import {ShortcutHandler} from 'src/ShortcutHandler';
import {JobsListQuery} from 'src/nav/types/JobsListQuery';
import {JobStatus} from 'src/types/globalTypes';
import {Box} from 'src/ui/Box';
import {BorderSetting} from 'src/ui/types';
import {DagsterRepoOption} from 'src/workspace/WorkspaceContext';
import {workspacePath} from 'src/workspace/workspacePath';

const iincludes = (haystack: string, needle: string) =>
  haystack.toLowerCase().includes(needle.toLowerCase());

interface JobsListProps {
  selector?: string;
  repo: DagsterRepoOption;
}

export const JobsList: React.FunctionComponent<JobsListProps> = ({repo, selector}) => {
  const [focused, setFocused] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const history = useHistory();
  const repoName = repo.repository.name;
  const repoLocation = repo.repositoryLocation.name;

  const [q, setQ] = React.useState<string>('');

  const jobs = useQuery<JobsListQuery>(JOBS_LIST_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: {
      repositorySelector: {
        repositoryLocationName: repo.repositoryLocation.name,
        repositoryName: repo.repository.name,
      },
    },
  });

  const [type, setType] = React.useState<'schedules' | 'sensors'>('schedules');
  const repoSchedules =
    jobs.data?.schedulesOrError?.__typename === 'Schedules'
      ? jobs.data.schedulesOrError.results
      : [];

  const repoSensors =
    jobs.data?.sensorsOrError?.__typename === 'Sensors' ? jobs.data.sensorsOrError.results : [];

  const items =
    type === 'schedules'
      ? repoSchedules
          .filter(({name}) => !q || iincludes(name, q))
          .map(({name, scheduleState}) => ({
            to: workspacePath(repoName, repoLocation, `/schedules/${name}`),
            label: name,
            jobType: 'schedule',
            status: scheduleState.status,
          }))
      : repoSensors
          .filter(({name}) => !q || iincludes(name, q))
          .map(({name, sensorState}) => ({
            to: workspacePath(repoName, repoLocation, `/sensors/${name}`),
            label: name,
            jobType: 'sensor',
            status: sensorState?.status,
          }));

  const onShiftFocus = (dir: 1 | -1) => {
    const idx = items.findIndex((p) => p.label === focused);
    if (idx === -1 && items[0]) {
      setFocused(items[0].label);
    } else if (items[idx + dir]) {
      setFocused(items[idx + dir].label);
    }
  };

  const onConfirmFocused = () => {
    if (focused) {
      const item = items.find((p) => p.label === focused);
      if (item) {
        history.push(item.to);
        return;
      }
    }
    if (items.length) {
      history.push(items[0].to);
      setFocused(items[0].label);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderTop: `1px solid ${Colors.DARK_GRAY4}`,
      }}
    >
      <Header>
        <ShortcutHandler
          onShortcut={() => inputRef.current?.focus()}
          shortcutFilter={(e) => e.altKey && e.keyCode === 83}
          shortcutLabel={`⌥S then Up / Down`}
        >
          <InputGroup
            type="text"
            inputRef={(c) => (inputRef.current = c)}
            value={q}
            small
            placeholder={`Search ${type}...`}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                onShiftFocus(1);
              }
              if (e.key === 'ArrowUp') {
                onShiftFocus(-1);
              }
              if (e.key === 'Enter' || e.key === 'Return') {
                onConfirmFocused();
              }
            }}
            onChange={(e: React.ChangeEvent<any>) => setQ(e.target.value)}
            style={{
              border: `1px solid ${Colors.DARK_GRAY5}`,
              background: Colors.DARK_GRAY4,
            }}
          />
        </ShortcutHandler>
        <div style={{width: 4}} />
        <ButtonGroup>
          <Button
            small={true}
            active={type === 'schedules'}
            intent={type === 'schedules' ? 'primary' : 'none'}
            icon={<Icon icon="time" iconSize={13} />}
            onClick={() => setType('schedules')}
          />
          <Button
            small={true}
            active={type === 'sensors'}
            intent={type === 'sensors' ? 'primary' : 'none'}
            icon={<Icon icon="automatic-updates" iconSize={13} />}
            onClick={() => setType('sensors')}
          />
        </ButtonGroup>
      </Header>
      <Items>
        <Box
          border={{width: 1, side: 'bottom', color: Colors.DARK_GRAY4}}
          padding={12}
          margin={{top: 0, bottom: 12, horizontal: 12}}
        >
          {items.length ? (
            <Item to={workspacePath(repoName, repoLocation, `/${type}`)}>All {type}</Item>
          ) : (
            <div>No {type} found</div>
          )}
        </Box>
        {items.map((p) => {
          const isFocused = p.label === focused;
          const isSelected = p.label === selector;
          const border: BorderSetting | null =
            isSelected || isFocused
              ? {side: 'left', width: 4, color: isSelected ? Colors.COBALT3 : Colors.GRAY3}
              : null;
          const icon = p.jobType === 'schedule' ? 'time' : 'automatic-updates';

          return (
            <Item
              key={p.label}
              className={`${isSelected ? 'selected' : ''} ${isFocused ? 'focused' : ''}`}
              to={p.to}
            >
              <Box
                background={isSelected ? Colors.BLACK : null}
                border={border}
                flex={{alignItems: 'center', justifyContent: 'space-between'}}
                padding={{vertical: 8, right: 8, left: 12}}
              >
                <Box
                  flex={{alignItems: 'center', justifyContent: 'flex-start'}}
                  style={{overflow: 'hidden'}}
                >
                  <Icon icon={icon} iconSize={14} />
                  <Label
                    data-tooltip={p.label}
                    data-tooltip-style={isSelected ? SelectedItemTooltipStyle : ItemTooltipStyle}
                  >
                    {p.label}
                  </Label>
                </Box>
                {p.status === JobStatus.RUNNING ? (
                  <Box margin={{left: 4}}>
                    <StatusDot size={9} />
                  </Box>
                ) : null}
              </Box>
            </Item>
          );
        })}
      </Items>
    </div>
  );
};

const Header = styled.div`
  margin: 6px 10px;
  display: flex;
  & .bp3-input-group {
    flex: 1;
  }
`;

const Label = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 8px;
  white-space: nowrap;
`;

const StatusDot = styled.div<{
  size: number;
}>`
  width: ${({size}) => size}px;
  height: ${({size}) => size}px;
  border-radius: ${({size}) => size / 2}px;
  background: ${Colors.GREEN2};
`;

const Items = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: calc((100vh - 405px) / 2);
  &::-webkit-scrollbar {
    width: 11px;
  }

  scrollbar-width: thin;
  scrollbar-color: ${Colors.GRAY1} ${Colors.DARK_GRAY1};

  &::-webkit-scrollbar-track {
    background: ${Colors.DARK_GRAY1};
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${Colors.GRAY1};
    border-radius: 6px;
    border: 3px solid ${Colors.DARK_GRAY1};
  }
`;

const Item = styled(Link)`
  font-size: 13px;
  color: ${Colors.LIGHT_GRAY3} !important;
  &:hover {
    text-decoration: none;
    color: ${Colors.WHITE} !important;
  }
  &:focus {
    outline: 0;
  }
  &.selected {
    font-weight: 600;
    color: ${Colors.WHITE} !important;
  }
`;

const BaseTooltipStyle = {
  fontSize: 13,
  padding: 3,
  paddingRight: 7,
  left: 9,
  top: 5,
  color: Colors.WHITE,
  background: Colors.DARK_GRAY1,
  transform: 'none',
  border: 0,
  borderRadius: 4,
};

const ItemTooltipStyle = JSON.stringify({
  ...BaseTooltipStyle,
  color: Colors.WHITE,
  background: Colors.DARK_GRAY1,
});

const SelectedItemTooltipStyle = JSON.stringify({
  ...BaseTooltipStyle,
  color: Colors.WHITE,
  background: Colors.BLACK,
  fontWeight: 600,
});

const JOBS_LIST_QUERY = gql`
  query JobsListQuery($repositorySelector: RepositorySelector!) {
    schedulesOrError(repositorySelector: $repositorySelector) {
      ... on Schedules {
        results {
          id
          name
          scheduleState {
            id
            status
          }
        }
      }
    }
    sensorsOrError(repositorySelector: $repositorySelector) {
      ... on Sensors {
        results {
          id
          name
          sensorState {
            id
            status
          }
        }
      }
    }
  }
`;
