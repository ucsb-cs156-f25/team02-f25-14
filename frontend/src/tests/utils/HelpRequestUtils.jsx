import {
    onDeleteSuccess,
    cellToAxiosParamsDelete,
  } from "main/utils/UCSBDateUtils";
  import mockConsole from "tests/testutils/mockConsole";
  
  const mockToast = vi.fn();
  vi.mock("react-toastify", async (importOriginal) => {
    const originalModule = await importOriginal();
    return {
      ...originalModule,
      toast: vi.fn((x) => mockToast(x)),
    };
  });
  
  describe("HelpRequestUtils tests", () => {
    describe("onDeleteSuccess", () => {
      test("It logs the message and shows a toast", () => {
        // arrange
        const restoreConsole = mockConsole();
  
        // act
        onDeleteSuccess("abc");
  
        // assert
        expect(mockToast).toHaveBeenCalledWith("abc");
        expect(console.log).toHaveBeenCalled();
        const message = console.log.mock.calls[0][0];
        expect(message).toMatch("abc");
  
        restoreConsole();
      });
    });
  
    describe("cellToAxiosParamsDelete", () => {
      test("It returns the correct axios params for delete", () => {
        // arrange
        const cell = { row: { values: { id: 17 } } };
  
        // act
        const result = cellToAxiosParamsDelete(cell);
  
        // assert
        expect(result).toEqual({
          url: "/api/helprequest",
          method: "DELETE",
          params: { id: 17 },
        });
      });
    });
  });
  