import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/HelpRequestUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function HelpRequestTable({
  helpRequests,
  currentUser,
  testIdPrefix = "HelpRequestTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/helprequest/edit/${cell.row.values.id}`);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/helprequest/all"]
  );

  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Requester Email",
      accessor: "requesterEmail",
    },
    {
      Header: "Team Id",
      accessor: "teamId",
    },
    {
      Header: "Table or Breakout Room",
      accessor: "tableOrBreakoutRoom",
    },
    {
      Header: "Request Time",
      accessor: "requestTime",
    },
    {
      Header: "Explanation",
      accessor: "explanation",
    },
    {
      Header: "Solved",
      accessor: "solved",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix));
  }

  return (
    <OurTable
      data={helpRequests}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}
