import { toast } from "react-toastify";

export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}

export function cellToAxiosParamsDelete(cell) {
  const id = cell?.row?.original.id ?? cell?.id;

  return {
    url: "/api/helprequest",
    method: "DELETE",
    params: { id },
  };
}
