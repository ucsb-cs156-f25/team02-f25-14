import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
  articleToCreateParams,
  articleToPutParams,
} from "main/utils/ArticlesUtils";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

describe("ArticlesUtils", () => {
  describe("onDeleteSuccess", () => {
    test("It puts the message on console.log and in a toast", () => {
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
    test("It returns the correct params", () => {
      // arrange
      const cell = { row: { original: { id: 17 } } };

      // act
      const result = cellToAxiosParamsDelete(cell);

      // assert
      expect(result).toEqual({
        url: "/api/articles",
        method: "DELETE",
        params: { id: 17 },
      });
    });
  });

  describe("articleToCreateParams", () => {
    test("adds default time when no time component present", () => {
      const article = {
        title: "Title",
        url: "https://example.com",
        explanation: "Explain",
        email: "user@example.com",
        dateAdded: "2023-11-10",
      };
      

      const result = articleToCreateParams(article);

      expect(result).toEqual(
        expect.objectContaining({
          url: "/api/articles/post",
          method: "POST",
          params: expect.objectContaining({
            dateAdded: "2023-11-10T00:00:00",
          }),
        }),
      );
    });

    test("appends seconds when missing", () => {
      const article = {
        title: "Title",
        url: "https://example.com",
        explanation: "Explain",
        email: "user@example.com",
        dateAdded: "2023-11-10T09:30",
      };

      const result = articleToCreateParams(article);

      expect(result.params.dateAdded).toBe("2023-11-10T09:30:00");
    });
  });

  describe("articleToPutParams", () => {
    test("passes through data with normalized date", () => {
      const article = {
        id: 7,
        title: "Title",
        url: "https://example.com",
        explanation: "Explain",
        email: "user@example.com",
        dateAdded: "2023-11-10T09:30",
      };

      const result = articleToPutParams(article);

      expect(result).toEqual(
        expect.objectContaining({
          url: "/api/articles",
          method: "PUT",
          params: { id: 7 },
          data: expect.objectContaining({
            dateAdded: "2023-11-10T09:30:00",
          }),
        }),
      );
    });
  });
});
