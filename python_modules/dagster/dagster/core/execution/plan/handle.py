import re
from collections import namedtuple

from dagster import check
from dagster.core.definitions.dependency import SolidHandle


class StepHandle(namedtuple("_StepHandle", "solid_handle")):
    """A reference to an ExecutionStep that was determined statically"""

    def __new__(cls, solid_handle):
        return super(StepHandle, cls).__new__(
            cls, solid_handle=check.inst_param(solid_handle, "solid_handle", SolidHandle),
        )

    def to_key(self):
        return f"{self.solid_handle.to_string()}"

    @staticmethod
    def from_key(string):
        unresolved_match = re.match(r"(.*)\[\?\]", string)
        if unresolved_match:
            return UnresolvedStepHandle(SolidHandle.from_string(unresolved_match.group(1)))

        resolved_match = re.match(r"(.*)\[(.*)\]", string)
        if resolved_match:
            return DynamicStepHandle(
                SolidHandle.from_string(resolved_match.group(1)), resolved_match.group(2)
            )

        return StepHandle(SolidHandle.from_string(string))


class UnresolvedStepHandle(namedtuple("_UnresolvedStepHandle", "solid_handle")):
    """A reference to an UnresolvedExecutionStep in an execution"""

    def __new__(cls, solid_handle):
        return super(UnresolvedStepHandle, cls).__new__(
            cls, solid_handle=check.inst_param(solid_handle, "solid_handle", SolidHandle),
        )

    def to_key(self):
        return f"{self.solid_handle.to_string()}[?]"

    def resolve(self, map_key):
        return DynamicStepHandle(self.solid_handle, map_key)


class DynamicStepHandle(namedtuple("_ResolvedStepHandle", "solid_handle mapping_key")):
    """
    A reference to an ExecutionStep that came from resolving an UnresolvedExecutionStep
    (and associated UnresolvedStepHandle) downstream of a dynamic output after it has
    completed successfully.
    """

    def __new__(cls, solid_handle, mapping_key):
        return super(DynamicStepHandle, cls).__new__(
            cls,
            solid_handle=check.inst_param(solid_handle, "solid_handle", SolidHandle),
            mapping_key=check.str_param(mapping_key, "mapping_key"),
        )

    def to_key(self):
        return f"{self.solid_handle.to_string()}[{self.mapping_key}]"

    @property
    def unresolved_form(self):
        return UnresolvedStepHandle(solid_handle=self.solid_handle)
