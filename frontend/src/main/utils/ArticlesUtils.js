import { toast } from "react-toastify";

const normalizeDateAdded = (dateAdded) => {
  if (!dateAdded) {
    return dateAdded;
  }

  if (!dateAdded.includes(":")) {
    return `${dateAdded}T00:00:00`;
  }

  if (/T\d{2}:\d{2}$/.test(dateAdded)) {
    return `${dateAdded}:00`;
  }

  return dateAdded;
};

export function articleToCreateParams({
  title,
  url,
  explanation,
  email,
  dateAdded,
}) {
  return {
    url: "/api/articles/post",
    method: "POST",
    params: {
      title,
      url,
      explanation,
      email,
      dateAdded: normalizeDateAdded(dateAdded),
    },
  };
}

export function articleToPutParams({
  id,
  title,
  url,
  explanation,
  email,
  dateAdded,
}) {
  return {
    url: "/api/articles",
    method: "PUT",
    params: {
      id,
    },
    data: {
      title,
      url,
      explanation,
      email,
      dateAdded: normalizeDateAdded(dateAdded),
    },
  };
}

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  return {
    url: "/api/articles",
    method: "DELETE",
    params: {
      id: cell.row.original.id,
    },
  };
}
