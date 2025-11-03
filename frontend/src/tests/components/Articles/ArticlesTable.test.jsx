import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { articlesFixtures } from "fixtures/articlesFixtures";

// We'll dynamically import the Articles module after we set up mocks/spies
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

// Mock the useBackend module so we can spy on useBackendMutation's arguments
vi.mock("main/utils/useBackend", async () => {
  const actual = await vi.importActual("main/utils/useBackend");
  const mockUseBackendMutation = vi.fn((...args) => {
    return actual.useBackendMutation(...args);
  });
  return {
    ...actual,
    useBackendMutation: mockUseBackendMutation,
    __mockUseBackendMutation: mockUseBackendMutation,
  };
});

const getArticlesModule = async () => {
  return await import("main/components/Articles/ArticlesTable");
};

describe("ArticlesTable tests", () => {
  const queryClient = new QueryClient();

  test("Has the expected column headers and content for ordinary user", async () => {
    const currentUser = currentUserFixtures.userOnly;

    const ArticlesModule = await getArticlesModule();
    const ArticlesTable = ArticlesModule.default;
    const { ARTICLES_QUERY_KEY } = ArticlesModule;
    // ensure the query key constant is correct (kills StringLiteral mutant)
    expect(ARTICLES_QUERY_KEY).toBe("/api/articles/all");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Title",
      "URL",
      "Explanation",
      "Email",
      "Date",
    ];
    const expectedFields = [
      "id",
      "title",
      "url",
      "explanation",
      "email",
      "dateAdded",
    ];
    const testId = "ArticlesTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  test("Has the expected colum headers and content for adminUser", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const ArticlesModule = await getArticlesModule();
    const ArticlesTable = ArticlesModule.default;
    const { ARTICLES_QUERY_KEY } = ArticlesModule;
    // ensure the query key constant is correct (kills StringLiteral mutant)
    expect(ARTICLES_QUERY_KEY).toBe("/api/articles/all");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = [
      "id",
      "Title",
      "URL",
      "Explanation",
      "Email",
      "Date",
    ];
    const expectedFields = [
      "id",
      "title",
      "url",
      "explanation",
      "email",
      "dateAdded",
    ];
    const testId = "ArticlesTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "3",
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the edit page for admin user", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const ArticlesModule = await getArticlesModule();
    const ArticlesTable = ArticlesModule.default;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`ArticlesTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const editButton = screen.getByTestId(
      `ArticlesTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/articles/edit/2"),
    );
  });

  test("Delete button calls delete callback", async () => {
    // arrange
    const currentUser = currentUserFixtures.adminUser;

    const ArticlesModule = await getArticlesModule();
    const ArticlesTable = ArticlesModule.default;
    const { ARTICLES_QUERY_KEY } = ArticlesModule;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/articles")
      .reply(200, { message: "Article deleted" });

    // spy on console.log to ensure onDeleteSuccess is called
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // ensure useBackendMutation was called with the expected dependency array
    const useBackend = await import("main/utils/useBackend");
    expect(useBackend.__mockUseBackendMutation).toHaveBeenCalled();
    const callArgs = useBackend.__mockUseBackendMutation.mock.calls[0];
    // deps is the 3rd argument passed to useBackendMutation
    expect(callArgs[2]).toEqual([ARTICLES_QUERY_KEY]);
    // ensure the query key constant is correct (kills StringLiteral mutant)
    expect(ARTICLES_QUERY_KEY).toBe("/api/articles/all");

    // assert - check that the expected content is rendered
    await waitFor(() => {
      expect(
        screen.getByTestId(`ArticlesTable-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    const deleteButton = screen.getByTestId(
      `ArticlesTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called
    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 2 });

    // ensure the query key constant is correct (kills StringLiteral/ArrayDeclaration mutants)
    expect(ARTICLES_QUERY_KEY).toBe("/api/articles/all");
    // ensure onDeleteSuccess logged the message (kills ObjectLiteral mutant)
    await waitFor(() => expect(logSpy).toHaveBeenCalled());
    logSpy.mockRestore();
  });
});
