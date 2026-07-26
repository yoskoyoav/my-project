from enum import Enum


class ExcelColumns(Enum):
    TABLE_NAME = "tableName"
    NAME = "name"
    ALIAS = "alias"
    TYPE = "type"
    DOMAIN = "domain"
    LENGTH = "length"
    DEFAULT_VALUE = "default_value"
    TO_ADD = "to_add"
    EXISTS = "exists"
    COMMON_ERROR = "common_error"
    GEOMETRY_TYPE = "geometry_type"
    ATTACHMENTS = "attachments"


class LayerNameExcel(Enum):
    LINE_REMARK = "Line_Remark"
    POINT_REMARK = "Point_Remark"
    HAZARDS = "Hazards"
    SITES = "Sites"
    ZOOLOGICAL_CAMERAS = "Zoological_Cameras"