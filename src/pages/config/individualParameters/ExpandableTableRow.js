import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { individualParamsSubTableURL } from "../../../helpers/Urls";
import client from "../../../helpers/Api";
import { getMsgsFromErrorCode } from "../../../helpers/utils";
import theme from "../../../theme/theme";
import Tooltip from "@mui/material/Tooltip";
import ReinstateIcon from "../../../components/Icons/ReInstateIcon";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditNoteIcon from "@mui/icons-material/EditNote";
import Box from "@mui/material/Box";
import CustomModal from "../../../components/customModal/CustomModal";
import ModifyParametersData from "./ModifyParametersData";
import { individualParamsDetailsURL } from "../../../helpers/Urls";
import { isUpdateAccessExist } from "../../../utils/cookies";
import moment from "moment/moment";

function ExpandableTableRow({
  parId,
  children,
  currentFilter,
  showDeleteParamDialog,
  parentDataRefresh,
  ...otherProps
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [subTableData, setSubTableData] = useState([]);
  const [showEditParamModal, setShowEditParamModal] = useState(false);
  const [selectedParam, setSelectedParam] = useState();

  const columns = [
    {
      id: "numericValue",
      label: "Number",
      align: "right",
    },
    {
      id: "textValue",
      label: "Text",
    },
    {
      id: "dateValue",
      label: "Date",
    },
    {
      id: "startDate",
      label: "Start Date",
    },
    {
      id: "endDate",
      label: "End Date",
    },
    {
      id: "actions",
      label: "Actions",
    },
  ];

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  useEffect(() => {
    if (isExpanded && parId) {
      fetchSubTableData();
    }
  }, [parId, isExpanded]);

  useEffect(() => {
    if (parentDataRefresh && isExpanded && parId) {
      fetchSubTableData();
    }
  }, [parentDataRefresh]);

  const fetchSubTableData = async () => {
    setLoading(true);
    setErrorMessages([]);
    try {
      const response =
        process.env.REACT_APP_ENV === "mockserver"
          ? await client.get(`${individualParamsSubTableURL}`)
          : await client.post(`${individualParamsSubTableURL}`, {
              parId,
              active: currentFilter,
            });
      setSubTableData(response);
    } catch (errorResponse) {
      setLoading(false);
      const newErrMsgs = getMsgsFromErrorCode(
        `POST:${process.env.REACT_APP_INDIVIDUAL_PARAM_SUB_TABLE_URL}`,
        errorResponse,
      );
      setErrorMessages(newErrMsgs);
    }
  };

  const fetchParamDetails = async (parId, showEditModal) => {
    setLoading(true);
    setErrorMessages([]);
    try {
      const response =
        process.env.REACT_APP_ENV === "mockserver"
          ? await client.get(`${individualParamsDetailsURL}`)
          : await client.get(`${individualParamsDetailsURL}${parId}`);
      setSelectedParam(response);

      if (showEditModal) {
        setShowEditParamModal(true);
      } else {
        setShowEditParamModal(true);
      }

      setLoading(false);
    } catch (errorResponse) {
      setLoading(false);
      const newErrMsgs = getMsgsFromErrorCode(
        `GET:${process.env.REACT_APP_INDIVIDUAL_PARAM_DETAILS_URL}`,
        errorResponse,
      );
      setErrorMessages(newErrMsgs);
    }
  };

  const renderColumn = (id, value, row) => {
    switch (id) {
      case "startDate":
        return (
          <Typography
            className={
              moment().diff(value) < 0
                ? "future-date-text"
                : row.editFlag === true
                  ? "past-date-text-editable"
                  : "past-date-text-non-editable"
            }
          >
            {value}
          </Typography>
        );
      default:
        return <Typography style={{ color: "gray" }}> {value}</Typography>;
    }
  };

  return (
    <>
      <StyledTableRow {...otherProps}>
        <TableCell padding="checkbox">
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <RemoveIcon /> : <AddIcon />}
          </IconButton>
        </TableCell>
        {children}
      </StyledTableRow>
      {isExpanded && (
        <TableRow>
          <TableCell padding="checkbox" colSpan={8}>
            <Stack alignItems="center">
              <Box
                sx={{
                  border: 1,
                  borderColor: "grey.300",
                  marginTop: 1,
                  marginBottom: 1,
                  width: "60%",
                }}
              >
                <Table
                  size="small"
                  aria-label="sticky table"
                  sx={{ margin: "1rem 0" }}
                >
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth, color: "gray" }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subTableData.map((row) => {
                      return (
                        <StyledTableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.code}
                          // sx={moment().diff(row.startDate) < 0 ? {backgroundColor: "#c5e1b7 !important"} : {}}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            return column.id !== "actions" ? (
                              <TableCell key={column.id} align={column.align}>
                                {renderColumn(column.id, value, row)}
                              </TableCell>
                            ) : (
                              <TableCell padding="checkbox">
                                <Stack
                                  spacing={theme.spacing(1)}
                                  alignItems="center"
                                  direction="row"
                                >
                                  {row.editFlag === true ? (
                                    <Tooltip title="Edit" placement="left">
                                      <IconButton
                                        disabled={!isUpdateAccessExist()}
                                      >
                                        <EditNoteIcon
                                          sx={{ cursor: "pointer" }}
                                          fontSize="medium"
                                          {...(isUpdateAccessExist() && {
                                            color: "primary",
                                          })}
                                          onClick={(event) => {
                                            fetchParamDetails(
                                              row.parId,
                                              true,
                                              fetchSubTableData,
                                            );
                                            event.preventDefault();
                                            event.stopPropagation();
                                          }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  ) : row.reinstateFlag === true ? (
                                    <ReinstateIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                      tooltipPlacement="left"
                                      onClick={(event) => {
                                        fetchParamDetails(row.parId, true);
                                        event.preventDefault();
                                        event.stopPropagation();
                                      }}
                                    />
                                  ) : (
                                    <Box sx={{ width: 23 }} />
                                  )}
                                  {row.deleteFlag === true ? (
                                    <Tooltip title="Delete" placement="right">
                                      <IconButton
                                        disabled={!isUpdateAccessExist()}
                                      >
                                        <DeleteForeverIcon
                                          onClick={(event) => {
                                            showDeleteParamDialog(
                                              event,
                                              row.parId,
                                            );
                                          }}
                                          sx={{ cursor: "pointer" }}
                                          fontSize="medium"
                                          {...(isUpdateAccessExist() && {
                                            color: "error",
                                          })}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  ) : (
                                    <></>
                                  )}
                                </Stack>
                              </TableCell>
                            );
                          })}
                        </StyledTableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Stack>
          </TableCell>
        </TableRow>
      )}
      <CustomModal
        open={showEditParamModal}
        onClose={() => setShowEditParamModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        title="Modify Individual Parameter"
        maxWidth="lg"
      >
        <ModifyParametersData
          selectedParam={selectedParam}
          closeModalPopup={(refresh = false) => {
            if (refresh) {
              fetchSubTableData();
            }
            setShowEditParamModal(false);
          }}
        />
      </CustomModal>
    </>
  );
}

export default React.memo(ExpandableTableRow);
