import { toast } from "react-toastify";

const normalizeDateAdded = (dateAdded) => {
  let normalized = dateAdded;
  if (normalized && !normalized.includes(":")) {
    normalized = `${normalized}T00:00:00`;
  } else if (normalized && normalized.match(/T\d{2}:\d{2}$/)) {
    normalized = `${normalized}:00`;
  }
  return normalized;
};

export function articleToCreateParams(article) {
  return {
    url: "/api/articles/post",
    method: "POST",
    params: {
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: normalizeDateAdded(article.dateAdded),
    },
  };
}

export function articleToPutParams(article) {
  return {
    url: "/api/articles",
    method: "PUT",
    params: {
      id: article.id,
    },
    data: {
      title: article.title,
      url: article.url,
      explanation: article.explanation,
      email: article.email,
      dateAdded: normalizeDateAdded(article.dateAdded),
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
