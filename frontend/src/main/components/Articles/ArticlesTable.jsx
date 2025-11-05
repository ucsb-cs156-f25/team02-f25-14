import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/utils/ArticlesUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export const ARTICLES_QUERY_KEY = "/api/articles/all";

export default function ArticlesTable({
  articles,
  currentUser,
  testIdPrefix = "ArticlesTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/articles/edit/${cell.row.original.id}`);
  };

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    [ARTICLES_QUERY_KEY],
  );

  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      header: "id",
      accessorKey: "id",
    },
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "URL",
      accessorKey: "url",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Date",
      accessorKey: "dateAdded",
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix));
  }

  return <OurTable data={articles} columns={columns} testid={testIdPrefix} />;
}
