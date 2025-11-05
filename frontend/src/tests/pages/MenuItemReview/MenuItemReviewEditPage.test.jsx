import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import MenuItemReviewEditPage from "main/pages/MenuItemReview/MenuItemReviewEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "tests/testutils/mockConsole";
import { beforeEach, afterEach } from "vitest";

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
describe("MenuItemReviewEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/menuitemreview", { params: { id: 17 } }).timeout();
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
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText(/Welcome/);
      await screen.findByText("Edit MenuItemReview");
      expect(
        screen.queryByTestId("MenuItemReview-itemId"),
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
      axiosMock
        .onGet("/api/menuitemreview", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          itemId: 1,
          reviewerEmail: "tester1@ucsb.edu",
          stars: 1,
          dateReviewed: "2022-03-14T15:00",
          comments: "Awful",
        });
      axiosMock.onPut("/api/menuitemreview").reply(200, {
        id: "17",
        itemId: "2",
        reviewerEmail: "tester2@ucsb.edu",
        stars: "5",
        dateReviewed: "2022-12-25T08:00",
        commnets: "Delicious",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders without crashing", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText(/Welcome/);
      await screen.findByTestId("MenuItemReview-itemId");
      expect(screen.getByTestId("MenuItemReview-itemId")).toBeInTheDocument();
    });

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReview-itemId");

      const idField = screen.getByTestId("MenuItemReview-id");
      const itemIdField = screen.getByTestId("MenuItemReview-itemId");
      const reviewerEmailField = screen.getByTestId(
        "MenuItemReview-reviewerEmail",
      );
      const starsField = screen.getByTestId("MenuItemReview-stars");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReview-dateReviewed",
      );
      const commentsField = screen.getByTestId("MenuItemReview-comments");
      const submitButton = screen.getByTestId("MenuItemReview-submit");

      expect(idField).toHaveValue("17");
      expect(itemIdField).toHaveValue(1);
      expect(reviewerEmailField).toHaveValue("tester1@ucsb.edu");
      expect(starsField).toHaveValue(1);
      expect(dateReviewedField).toHaveValue("2022-03-14T15:00");
      expect(commentsField).toHaveValue("Awful");
      expect(submitButton).toBeInTheDocument();
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <MenuItemReviewEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("MenuItemReview-itemId");

      const idField = screen.getByTestId("MenuItemReview-id");
      const itemIdField = screen.getByTestId("MenuItemReview-itemId");
      const reviewerEmailField = screen.getByTestId(
        "MenuItemReview-reviewerEmail",
      );
      const starsField = screen.getByTestId("MenuItemReview-stars");
      const dateReviewedField = screen.getByTestId(
        "MenuItemReview-dateReviewed",
      );
      const commentsField = screen.getByTestId("MenuItemReview-comments");
      const submitButton = screen.getByTestId("MenuItemReview-submit");

      expect(idField).toHaveValue("17");
      expect(itemIdField).toHaveValue(1);
      expect(reviewerEmailField).toHaveValue("tester1@ucsb.edu");
      expect(starsField).toHaveValue(1);
      expect(dateReviewedField).toHaveValue("2022-03-14T15:00");
      expect(commentsField).toHaveValue("Awful");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(itemIdField, { target: { value: "2" } });
      fireEvent.change(reviewerEmailField, {
        target: { value: "tester2@ucsb.edu" },
      });
      fireEvent.change(starsField, { target: { value: "5" } });
      fireEvent.change(dateReviewedField, {
        target: { value: "2022-12-25T08:00" },
      });
      fireEvent.change(commentsField, { target: { value: "Delicious" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "MenuItemReview Updated - id: 17, reviewer: tester2@ucsb.edu",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          itemId: "2",
          reviewerEmail: "tester2@ucsb.edu",
          stars: "5",
          dateReviewed: "2022-12-25T08:00",
          comments: "Delicious",
        }),
      ); // posted object
    });
  });
});
