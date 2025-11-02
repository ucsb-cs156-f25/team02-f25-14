import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import ArticlesForm from "main/components/Articles/ArticlesForm";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Title", "URL", "Explanation", "Email", "Date Added (ISO)"];
  const testId = "ArticlesForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
  const initial = { id: 17, title: "Test", url: "https://example.com", explanation: "Desc", email: "a@b.com", dateAdded: "2025-01-01T12:00" };
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm initialContents={initial} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    // Title, URL, and DateAdded are required
    await screen.findByText(/Title is required/);
    expect(screen.getByText(/URL is required/)).toBeInTheDocument();
    expect(screen.getByText(/DateAdded is required/)).toBeInTheDocument();

    const urlInput = screen.getByTestId(`${testId}-url`);
    // exceed max length for url
    fireEvent.change(urlInput, { target: { value: "http://" + "a".repeat(501) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 500 characters/)).toBeInTheDocument();
    });

    // trigger explanation maxLength and invalid email to cover optional chaining branches
    const explanationInput = screen.getByTestId(`${testId}-explanation`);
    const emailInput = screen.getByTestId(`${testId}-email`);
    fireEvent.change(explanationInput, { target: { value: "a".repeat(2001) } });
    fireEvent.change(emailInput, { target: { value: "not-an-email" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 2000 characters/)).toBeInTheDocument();
      expect(screen.getByText(/Must be a valid email address/)).toBeInTheDocument();
    });
  });

  test("shows title max length and url pattern errors", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm />
        </Router>
      </QueryClientProvider>,
    );

    const titleInput = screen.getByTestId(`${testId}-title`);
    const urlInput = screen.getByTestId(`${testId}-url`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    // exceed title max length
    fireEvent.change(titleInput, { target: { value: "a".repeat(201) } });
    // invalid url that doesn't start with http/https
    fireEvent.change(urlInput, { target: { value: "ftp://example.com" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 200 characters/)).toBeInTheDocument();
      expect(screen.getByText(/URL must start with http:\/\/ or https:\/\//)).toBeInTheDocument();
    });
  });

  test("calls submitAction with correct data when form is valid", async () => {
    const submitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <ArticlesForm submitAction={submitAction} />
        </Router>
      </QueryClientProvider>,
    );

    // fill in valid values
    const titleInput = screen.getByTestId(`${testId}-title`);
    const urlInput = screen.getByTestId(`${testId}-url`);
    const explanationInput = screen.getByTestId(`${testId}-explanation`);
    const emailInput = screen.getByTestId(`${testId}-email`);
    const dateInput = screen.getByTestId(`${testId}-dateAdded`);

    fireEvent.change(titleInput, { target: { value: "A good title" } });
    fireEvent.change(urlInput, { target: { value: "https://example.com/article" } });
    fireEvent.change(explanationInput, { target: { value: "Some explanation" } });
    fireEvent.change(emailInput, { target: { value: "author@example.com" } });
    // datetime-local expects YYYY-MM-DDTHH:MM
    fireEvent.change(dateInput, { target: { value: "2025-11-02T12:34" } });

    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    await waitFor(() => expect(submitAction).toHaveBeenCalled());

    // Assert payload contains our values
    const calledWith = submitAction.mock.calls[0][0];
    expect(calledWith.title).toBe("A good title");
    expect(calledWith.url).toBe("https://example.com/article");
    expect(calledWith.explanation).toBe("Some explanation");
    expect(calledWith.email).toBe("author@example.com");
    expect(calledWith.dateAdded).toBe("2025-11-02T12:34");
  });
});
