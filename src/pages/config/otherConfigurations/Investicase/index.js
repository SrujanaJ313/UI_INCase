import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

import { styled } from "@mui/material/styles";
import CustomModal from "../../../../components/customModal/CustomModal";
import client from "../../../../helpers/Api";
// import { serverErrorMessages } from "../../../../helpers/Constants";
import {
  otherConfigInvesticaseSearchURL,
  otherConfigInvesticaseDetailsURL,
  otherConfigInvesticaseDeleteURL,
} from "../../../../helpers/Urls";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { getMsgsFromErrorCode } from "../../../../helpers/utils";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CachedIcon from "@mui/icons-material/Cached";
import theme from "../../../../theme/theme";
import ViewParametersData from "./ViewParametersData";
import ModifyParametersData from "./ModifyParametersData";
import Tooltip from "@mui/material/Tooltip";
import { isUpdateAccessExist } from "../../../../utils/cookies";
import ExpandableTableRow from "./ExpandableTableRow";
import moment from "moment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ReinstateIcon from "../../../../components/Icons/ReInstateIcon";

export default function Investicase() {
  const [loading, setLoading] = useState(false);
  const [errorMessages, setErrorMessages] = useState([]);

  const [selectedParam, setSelectedParam] = useState();
  const [showViewParamModal, setShowViewParamModal] = useState(false);
  const [showEditParamModal, setShowEditParamModal] = useState(false);
  const [data, setData] = useState([]);
  const [showDeleteParamConfirModal, setShowDeleteParamConfirModal] =
    useState(false);
  const [selectedParamIdForDelete, setSelectedParamIdForDelete] =
    useState(false);

  const [showActiveEntries, setShowActiveEntries] = useState(true);
  const [showInActiveEntries, setShowInActiveEntries] = useState(false);
  const [active, setActive] = useState("Y");
  const [currentFilter, setCurrentFilter] = useState("Y");

  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    needTotalCount: true,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [parentDataRefresh, setParentDataRefresh] = useState(false);

  const columns = [
    { id: "name", label: "NAME" },
    {
      id: "spaAttrWeight",
      label: "WEIGHT",
    },
    {
      id: "spaAutoMark",
      label: "AUTOMARK IND",
    },
    {
      id: "startDate",
      label: "START DATE",
    },
    {
      id: "idhSubmitScore",
      label: "IDH SUBMIT SCORE",
    }
  ];

  useEffect(() => {
    const payload = {
      pagination: pagination,
      active: "Y",
    };
    fetchData(payload);
  }, []);

  useEffect(() => {
    let active = "";
    if (
      (showActiveEntries && showInActiveEntries) ||
      (!showActiveEntries && !showInActiveEntries)
    ) {
      active = "ALL";
    } else if (showActiveEntries) {
      active = "Y";
    } else if (showInActiveEntries) {
      active = "N";
    }
    setActive(active);
  }, [showActiveEntries, showInActiveEntries]);

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    "&:last-child td, &:last-child th": {
      border: 0,
    },
  }));

  const renderColumn = (id, value, row) => {
    switch (id) {
      case "name":
        return (
          <Typography
            className={
              row.editFlag === true
                ? "clickable-active-text"
                : "clickable-inactive-text"
            }
            onClick={() => {
              fetchParamDetails(row.spaId, false);
            }}
          >
            {value && (
              <div
                style={{
                  display: "flex",
                  // justifyContent: "space-between",
                  width: "80%",
                }}
              >
                <div style={{ display: "flex", alignSelf: "center" }}>
                  {value}
                </div>
                <div>
                  {row["parentName"] && ( 
                    <Tooltip title={row["parentName"]}>
                      <IconButton disabled={!row.editFlag}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              </div>
            )}
          </Typography>
        );
      // case "parentAttributeName":
      //   return (
      //     <Typography
      //       style={{ color: row.editFlag === true ? "gray" : "silver" }}
      //     >
      //       {/* {value === "Y" ? "Yes" : "No"} */}
      //       {value && (
      //         <div style={{ display: "flex" }}>
      //           <div style={{ padding: "1px" }}>{value}</div>
      //           <div>
      //             <InfoOutlinedIcon fontSize="small" />
      //           </div>
      //         </div>
      //       )}
      //     </Typography>
      //   );

      case "spaAttrWeight":
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

      case "idhSubmitScore":
        return (
          <Typography
            className={
              row.editFlag === true
                ? "clickable-active-text"
                : "clickable-inactive-text"
            }
            onClick={() => {
              fetchParamDetails(row.spaId, false);
            }}
          >
            <div style={{ display: "flex" }}>
              <div
                style={{
                  display: "flex",
                  width: "30%",
                  alignSelf: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: "40%" }}>
                  {row["spaMinThresholdValSarSubmit"] > 99 ? "> 99" : row["spaMinThresholdValSarSubmit"]}
                </div>
                <div>|</div>
                <div>{row["spaSarSubmitSpecialRuleInd"]}</div>
              </div>
              <div>
                {row["spaMinThresholdValSarSubmit"] > 99 &&
                  row["spaSarSubmitSpecialRuleInd"] === "Y" && (
                    <Tooltip title={"Rule desc"}>
                      <IconButton>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
              </div>
            </div>
          </Typography>
        );
      default:
        return (
          <Typography
            style={{ color: row.editFlag === true ? "gray" : "silver" }}
          >
            {" "}
            {value}
          </Typography>
        );
    }
  };

  const fetchData = async (payload) => {
    setLoading(true);
    setErrorMessages([]);
    try {
      const response =
        process.env.REACT_APP_ENV === "mockserver"
          ? await client.get(`${otherConfigInvesticaseSearchURL}`)
          : await client.post(`${otherConfigInvesticaseSearchURL}`, payload);

      setData(response.spideringAttributesList || []);
      setTotalCount(response.pagination.totalItemCount);
      setLoading(false);
      setCurrentFilter(active);
    } catch (errorResponse) {
      setLoading(false);
      const newErrMsgs = getMsgsFromErrorCode(
        `POST:${process.env.REACT_APP_OTHER_CONFIG_INVESTICASE_SEARCH_URL}`,
        errorResponse
      );
      setErrorMessages(newErrMsgs);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);

    const paginationPayload = {
      pageNumber: newPage + 1,
      pageSize: pagination.pageSize,
      needTotalCount: true,
    };
    setPagination(paginationPayload);

    const payload = {
      pagination: paginationPayload,
      active,
    };
    fetchData(payload);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);

    const paginationPayload = {
      pageNumber: 1,
      pageSize: event.target.value,
      needTotalCount: true,
    };
    setPagination(paginationPayload);

    const payload = {
      pagination: paginationPayload,
      active,
    };
    fetchData(payload);
  };

  const refreshData = () => {
    if (showToolTipMsg) return;
    setPage(0);

    const paginationPayload = {
      pageNumber: 1,
      pageSize: pagination.pageSize,
      needTotalCount: true,
    };
    setPagination(paginationPayload);

    const payload = {
      pagination: paginationPayload,
      active,
    };
    fetchData(payload);
    setParentDataRefresh(true);
    setTimeout(() => {
      setParentDataRefresh(false);
    }, 3000);
  };

  const fetchParamDetails = async (
    spaId,
    showEditModal,
    reinstateFlag = false
  ) => {
    setLoading(true);
    setErrorMessages([]);
    try {
      const response =
        process.env.REACT_APP_ENV === "mockserver"
          ? await client.get(`${otherConfigInvesticaseDetailsURL}`)
          : await client.get(`${otherConfigInvesticaseDetailsURL}${spaId}`);

      setSelectedParam({ ...response, reinstateFlag });

      if (showEditModal) {
        setShowEditParamModal(true);
      } else {
        setShowViewParamModal(true);
      }
      setLoading(false);
    } catch (errorResponse) {
      setLoading(false);
      const newErrMsgs = getMsgsFromErrorCode(
        `GET:${process.env.REACT_APP_OTHER_CONFIG_INVESTICASE_DETAILS_URL}`,
        errorResponse
      );
      setErrorMessages(newErrMsgs);
    }
  };

  const showDeleteParamDialog = (event, spaId) => {
    setSelectedParamIdForDelete(spaId);
    setShowDeleteParamConfirModal(true);
    event.preventDefault();
    event.stopPropagation();
  };
  const deletParam = async () => {
    setErrorMessages([]);

    try {
      const response =
        process.env.REACT_APP_ENV === "mockserver"
          ? await client.get(`${otherConfigInvesticaseDeleteURL}`)
          : await client.delete(
            `${otherConfigInvesticaseDeleteURL}${selectedParamIdForDelete}`
          );
      setShowDeleteParamConfirModal(false);
      refreshData();
    } catch (errorResponse) {
      const newErrMsgs = getMsgsFromErrorCode(
        `DELETE:${process.env.REACT_APP_OTHER_CONFIG_INVESTICASE_DELETE_URL}`,
        errorResponse
      );
      setErrorMessages(newErrMsgs);
    }
  };

  const showToolTipMsg =
    showActiveEntries === false && showInActiveEntries === false;

  return (
    <>
      <Stack>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography className="label-text">
            <span className="required">*</span>Display:
          </Typography>
          <FormControlLabel
            name="activeEntries"
            onChange={(event, checked) => {
              setShowActiveEntries(checked);
            }}
            control={<Checkbox checked={showActiveEntries} />}
            label="Active entries"
          />
          <FormControlLabel
            name="inactiveEntries"
            onChange={(event, checked) => {
              setShowInActiveEntries(checked);
            }}
            control={<Checkbox checked={showInActiveEntries} />}
            label="Inactive entries"
          />
          <Tooltip
            title={
              showToolTipMsg
                ? "Please select atleast one checkbox"
                : "Refresh Data"
            }
            placement="top"
          >
            <CachedIcon
              disabled={true}
              sx={{ cursor: "pointer" }}
              fontSize="medium"
              color="primary"
              onClick={refreshData}
            />
          </Tooltip>
        </Stack>
        <Paper square elevation={10} sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table size="small" stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell
                    padding="checkbox"
                    sx={{ backgroundColor: "#183084", maxWidth: "10px" }}
                  ></TableCell>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      style={{
                        minWidth: column.minWidth,
                        fontWeight: "bold",
                        backgroundColor: "#183084",
                        color: "white",
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                  <TableCell
                    style={{
                      minWidth: 150,
                      fontWeight: "bold",
                      backgroundColor: "#183084",
                      color: "white",
                    }}
                  >
                    <Stack
                      spacing={theme.spacing(1)}
                      alignItems="center"
                      justifyContent="center"
                    >
                      Actions
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((row) => {
                  return (
                    <>
                      {row.childListCount > 0 ? (
                        <ExpandableTableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.spaId}
                          spaId={row.spaId}
                          fetchParamDetails={fetchParamDetails}
                          showDeleteParamDialog={showDeleteParamDialog}
                          currentFilter={currentFilter}
                          parentDataRefresh={parentDataRefresh}
                        >
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {renderColumn(column.id, value, row)}
                              </TableCell>
                            );
                          })}
                          <TableCell padding="checkbox">
                            <Stack
                              spacing={theme.spacing(1)}
                              alignItems="center"
                              direction="row"
                              justifyContent="center"
                            >
                              {row.editFlag === true && (
                                <Tooltip title="Edit" placement="left">
                                  <IconButton disabled={!isUpdateAccessExist()}>
                                    <EditNoteIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                      {...(isUpdateAccessExist() && {
                                        color: "primary",
                                      })}
                                      onClick={(event) => {
                                        fetchParamDetails(row.spaId, true);
                                        event.preventDefault();
                                        event.stopPropagation();
                                      }}
                                    />
                                  </IconButton>
                                </Tooltip>
                              ) }
                              {row.deleteFlag === true ? (
                                <Tooltip title="Delete" placement="right">
                                  <IconButton disabled={!isUpdateAccessExist()}>
                                    <DeleteForeverIcon
                                      onClick={(event) => {
                                        showDeleteParamDialog(event, row.spaId);
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
                              {row.reinstateFlag === true && (
                                <ReinstateIcon
                                  sx={{ cursor: "pointer" }}
                                  fontSize="medium"
                                  tooltipPlacement="left"
                                  onClick={(event) => {
                                    fetchParamDetails(
                                      row.spaId,
                                      true,
                                      row.reinstateFlag
                                    );
                                    event.preventDefault();
                                    event.stopPropagation();
                                  }}
                                />
                              ) }
                            </Stack>
                          </TableCell>
                        </ExpandableTableRow>
                      ) : (
                        <StyledTableRow
                          hover
                          role="checkbox"
                          tabIndex={-1}
                          key={row.code}
                        >
                          <TableCell
                            padding="checkbox"
                            sx={{
                              // backgroundColor: "#183084",
                              maxWidth: "10px",
                            }}
                          ></TableCell>
                          {columns.map((column) => {
                            const value = row[column.id];
                            return (
                              <TableCell key={column.id} align={column.align}>
                                {renderColumn(column.id, value, row)}
                              </TableCell>
                            );
                          })}
                          <TableCell padding="checkbox">
                            <Stack
                              spacing={theme.spacing(1)}
                              alignItems="center"
                              direction="row"
                              justifyContent="center"
                            >
                              {row.editFlag === true ? (
                                <Tooltip title="Edit" placement="left">
                                  <IconButton disabled={!isUpdateAccessExist()}>
                                    <EditNoteIcon
                                      sx={{ cursor: "pointer" }}
                                      fontSize="medium"
                                      {...(isUpdateAccessExist() && {
                                        color: "primary",
                                      })}
                                      onClick={(event) => {
                                        fetchParamDetails(row.spaId, true);
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
                                    fetchParamDetails(
                                      row.spaId,
                                      true,
                                      row?.reinstateFlag
                                    );
                                    event.preventDefault();
                                    event.stopPropagation();
                                  }}
                                />
                              ) : (
                                <Box sx={{ width: 23 }} />
                              )}
                              {row.deleteFlag === true ? (
                                <Tooltip title="Delete" placement="right">
                                  <IconButton disabled={!isUpdateAccessExist()}>
                                    <DeleteForeverIcon
                                      onClick={(event) => {
                                        showDeleteParamDialog(event, row.spaId);
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
                        </StyledTableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Stack>

      <CustomModal
        open={showViewParamModal}
        onClose={() => setShowViewParamModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        title="View Spidering Attributes"
        maxWidth="md"
      >
        <DialogContent>
          <Stack mt={3}>
            <ViewParametersData selectedParam={selectedParam} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ margin: 2 }}>
          <Button
            variant="contained"
            onClick={() => setShowViewParamModal(false)}
          >
            Close
          </Button>
        </DialogActions>
      </CustomModal>

      <CustomModal
        open={showEditParamModal}
        onClose={() => setShowEditParamModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        title="Edit Spidering Attributes Configuration"
        maxWidth="lg"
      >
        <ModifyParametersData
          selectedParam={selectedParam}
          closeModalPopup={(refresh = false) => {
            if (refresh) {
              refreshData();
            }
            setShowEditParamModal(false);
          }}
        />
      </CustomModal>

      <CustomModal
        open={showDeleteParamConfirModal}
        onClose={() => setShowDeleteParamConfirModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        title="Delete Work Search Waiver"
      >
        <DialogContent>
          <Stack
            width="100%"
            justifyContent="center"
            alignItems="center"
            mt={2}
          >
            Are you sure you want to delete the selected Parameter?
          </Stack>
          <Stack mt={1} direction="row" useFlexGap flexWrap="wrap">
            {errorMessages.map((x) => (
              <div>
                <span className="errorMsg">*{x}</span>
              </div>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ margin: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setShowDeleteParamConfirModal(false)}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={() => deletParam()}>
            Yes
          </Button>
        </DialogActions>
      </CustomModal>
    </>
  );
}
