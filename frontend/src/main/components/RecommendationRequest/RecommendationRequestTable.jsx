import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/recommendationRequestUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function RecommendationRequestTable({
  recommendationrequest,
  currentUser,
  testIdPrefix = "RecommendationRequest",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/recommendationrequests/edit/${cell.row.original.id}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/recommendationrequests/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id", // accessor is the "key" in the data
    },

    {
      header: "Requester Email",
      accessorKey: "requesteremail",
    },
    {
      header: "Professor Email",
      accessorKey: "professoremail",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Date Requested",
      accessorKey: "daterequested",
    },
    {
      header: "Date Needed",
      accessorKey: "dateneeded",
    },
    {
      header: "Done",
      accessorKey: "done",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable
      data={recommendationrequest}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}
