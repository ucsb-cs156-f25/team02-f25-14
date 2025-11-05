import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("MenuItemReview-itemId")).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 17,
      itemId: 15,
      reviewerEmail: "elonmusk@gmail.com",
      stars: 3,
      dateReviewed: "2022-02-02T00:00",
      comments: "Tasty",
    };

    axiosMock.onPost("/api/menuitemreview/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("MenuItemReview-itemId")).toBeInTheDocument();
    });

    const itemIdField = screen.getByTestId("MenuItemReview-itemId");
    const reviewerEmailField = screen.getByTestId(
      "MenuItemReview-reviewerEmail",
    );
    const starsField = screen.getByTestId("MenuItemReview-stars");
    const dateReviewedField = screen.getByTestId("MenuItemReview-dateReviewed");
    const commentsField = screen.getByTestId("MenuItemReview-comments");
    const submitButton = screen.getByTestId("MenuItemReview-submit");

    fireEvent.change(itemIdField, { target: { value: 15 } });
    fireEvent.change(reviewerEmailField, {
      target: { value: "elonmusk@gmail.com" },
    });
    fireEvent.change(starsField, { target: { value: 3 } });
    fireEvent.change(dateReviewedField, {
      target: { value: "2022-02-02T00:00" },
    });
    fireEvent.change(commentsField, { target: { value: "Tasty" } });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: "15",
      reviewerEmail: "elonmusk@gmail.com",
      stars: "3",
      dateReviewed: "2022-02-02T00:00",
      comments: "Tasty",
    });

    expect(mockToast).toBeCalledWith(
      "New review created — id: 17, reviewer: elonmusk@gmail.com",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });
});
