import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/HelpRequestUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function HelpRequestTable({helpRequests,currentUser,testIdPrefix = "HelpRequestTable",}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/helprequest/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/helprequest/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  
  const columns = [
    { id: "id", Header: "id", accessor: "id" },
    { id: "requesterEmail", Header: "Requester Email", accessor: "requesterEmail" },
    { id: "teamId", Header: "Team Id", accessor: "teamId" },
    { id: "tableOrBreakoutRoom", Header: "Table or Breakout Room", accessor: "tableOrBreakoutRoom" },
    { id: "requestTime", Header: "Request Time", accessor: "requestTime" },
    { id: "explanation", Header: "Explanation", accessor: "explanation" },
    { id: "solved", Header: "Solved", accessor: "solved" },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push({
        id: "Edit",
        ...ButtonColumn("Edit", "primary", editCallback, testIdPrefix),
      });    
    columns.push({
        id: "Delete",
        ...ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
        });
  }

  return (
    <OurTable data={helpRequests} columns={columns} testid={testIdPrefix} />
  );
}