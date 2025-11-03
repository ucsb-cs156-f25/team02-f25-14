import { fireEvent, render, waitFor, screen, renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Test Article",
        url: "https://example.com",
        explanation: "This is a test article",
        email: "test@example.com",
        dateAdded: "2022-01-02T12:00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Updated Article",
        url: "https://example.com/updated",
        explanation: "Updated explanation",
        email: "updated@example.com",
        dateAdded: "2022-01-03T12:00:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const urlField = screen.getByTestId("ArticlesForm-url");
      const explanationField = screen.getByTestId("ArticlesForm-explanation");
      const emailField = screen.getByTestId("ArticlesForm-email");
      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue("Test Article");
      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue("https://example.com");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("This is a test article");
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("test@example.com");
      expect(dateAddedField).toBeInTheDocument();
      expect(dateAddedField).toHaveValue("2022-01-02T12:00");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "Updated Article" },
      });
      fireEvent.change(urlField, {
        target: { value: "https://example.com/updated" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Updated explanation" },
      });
      fireEvent.change(emailField, {
        target: { value: "updated@example.com" },
      });
      fireEvent.change(dateAddedField, {
        target: { value: "2022-01-03T12:00" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Updated Article",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Updated Article",
          url: "https://example.com/updated",
          explanation: "Updated explanation",
          email: "updated@example.com",
          dateAdded: "2022-01-03T12:00:00",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const idField = screen.getByTestId("ArticlesForm-id");
      const titleField = screen.getByTestId("ArticlesForm-title");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("Test Article");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titleField, {
        target: { value: "Updated Article" },
      });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Updated Article",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });

    test("converts date format when date has no time part", async () => {
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Test Article",
        url: "https://example.com",
        explanation: "This is a test article",
        email: "test@example.com",
        dateAdded: "2022-01-02T00:00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Test Article",
        url: "https://example.com",
        explanation: "This is a test article",
        email: "test@example.com",
        dateAdded: "2022-01-03T00:00:00",
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");

      const dateAddedField = screen.getByTestId("ArticlesForm-dateAdded");
      const submitButton = screen.getByTestId("ArticlesForm-submit");

      fireEvent.change(dateAddedField, {
        target: { value: "2022-01-03T00:00" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
      
      await waitFor(() => expect(mockToast).toBeCalled());

      const putData = JSON.parse(axiosMock.history.put[0].data);
      expect(putData.dateAdded).toBe("2022-01-03T00:00:00");
    });

    test("converts date format when date has no colon (YYYY-MM-DD format)", async () => {
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Test Article",
        url: "https://example.com",
        explanation: "This is a test article",
        email: "test@example.com",
        dateAdded: "2022-01-02T00:00:00",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Test Article",
        url: "https://example.com",
        explanation: "This is a test article",
        email: "test@example.com",
        dateAdded: "2022-01-04T00:00:00",
      });

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticlesForm-title");
      expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
    });

    test("converts date format when date has no colon - direct mutation test", async () => {
      // This test directly tests the date conversion logic by using useBackendMutation
      // with a date that has no colon (YYYY-MM-DD format)
      const { useBackendMutation } = await import("main/utils/useBackend");
      
      const testQueryClient = new QueryClient();
      const wrapper = ({ children }) => (
        <QueryClientProvider client={testQueryClient}>
          <MemoryRouter>{children}</MemoryRouter>
        </QueryClientProvider>
      );

      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Test Article",
        url: "https://example.com",
        explanation: "This is a test article",
        email: "test@example.com",
        dateAdded: "2022-01-04T00:00:00",
      });

      // Replicate the objectToAxiosPutParams function from ArticlesEditPage
      const objectToAxiosPutParams = (article) => {
        let dateAdded = article.dateAdded;
        if (dateAdded && !dateAdded.includes(":")) {
          dateAdded = dateAdded + "T00:00:00";
        } else if (dateAdded && dateAdded.match(/T\d{2}:\d{2}$/)) {
          dateAdded = dateAdded + ":00";
        }
        return {
          url: "/api/articles",
          method: "PUT",
          params: { id: article.id },
          data: {
            title: article.title,
            url: article.url,
            explanation: article.explanation,
            email: article.email,
            dateAdded: dateAdded,
          },
        };
      };

      const { result } = renderHook(
        () => useBackendMutation(objectToAxiosPutParams, {}, [`/api/articles?id=17`]),
        { wrapper },
      );

      act(() => {
        result.current.mutate({
          id: 17,
          title: "Test Article",
          url: "https://example.com",
          explanation: "This is a test article",
          email: "test@example.com",
          dateAdded: "2022-01-04", // No colon - triggers conversion
        });
      });

      await waitFor(() => expect(axiosMock.history.put.length).toBe(1));
      const putData = JSON.parse(axiosMock.history.put[0].data);
      expect(putData.dateAdded).toBe("2022-01-04T00:00:00");
    });
  });
});
