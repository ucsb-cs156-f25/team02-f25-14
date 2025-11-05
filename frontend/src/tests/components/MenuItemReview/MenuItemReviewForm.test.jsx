import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import MenuItemReviewForm from "main/components/MenuItemReview/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByText(/Item ID/);
    await screen.findByText(/Create/);
    expect(screen.getByText(/Item ID/)).toBeInTheDocument();
  });

  test("renders correctly when passing in a MenuItemReview", async () => {
    render(
      <Router>
        <MenuItemReviewForm
          initialContents={menuItemReviewFixtures.oneReview}
        />
      </Router>,
    );
    await screen.findByTestId(/MenuItemReview-id/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
    expect(screen.getByTestId(/MenuItemReview-id/)).toHaveValue("1");
  });

  test("Correct Error messsages on bad input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );

    await screen.findByTestId("MenuItemReview-itemId");
    const starsField = screen.getByTestId("MenuItemReview-stars");
    const dateReviewedField = screen.getByTestId("MenuItemReview-dateReviewed");
    const submitButton = screen.getByTestId("MenuItemReview-submit");

    fireEvent.change(starsField, { target: { value: 0 } }); // below min
    fireEvent.change(dateReviewedField, { target: { value: "bad-date" } }); // invalid pattern
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Minimum 1 star/)).toBeInTheDocument();
    expect(
      await screen.findByText(/dateReviewed is required/),
    ).toBeInTheDocument();
  });

  test("Correct Error messsages on missing input", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReview-submit");
    const submitButton = screen.getByTestId("MenuItemReview-submit");

    fireEvent.click(submitButton);

    await screen.findByText(/itemId is required./);
    expect(screen.getByText(/reviewerEmail is required./)).toBeInTheDocument();
    expect(screen.getByText(/stars is required./)).toBeInTheDocument();
    expect(screen.getByText(/dateReviewed is required./)).toBeInTheDocument();
    expect(screen.getByText(/comments is required./)).toBeInTheDocument();
  });

  test("Correct Error messsages on stars > 5", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReview-itemId");
    const starsField = screen.getByTestId("MenuItemReview-stars");
    const submitButton = screen.getByTestId("MenuItemReview-submit");

    fireEvent.change(starsField, { target: { value: 6 } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/Maximum 5 stars/)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <MenuItemReviewForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByTestId("MenuItemReview-itemId");

    const itemIdField = screen.getByTestId("MenuItemReview-itemId");
    const reviewerEmailField = screen.getByTestId(
      "MenuItemReview-reviewerEmail",
    );
    const starsField = screen.getByTestId("MenuItemReview-stars");
    const dateReviewedField = screen.getByTestId("MenuItemReview-dateReviewed");
    const commentsField = screen.getByTestId("MenuItemReview-comments");
    const submitButton = screen.getByTestId("MenuItemReview-submit");

    fireEvent.change(itemIdField, { target: { value: 1 } });
    fireEvent.change(reviewerEmailField, {
      target: { value: "cguacho@ucsb.edu" },
    });
    fireEvent.change(starsField, { target: { value: 4 } });
    fireEvent.change(dateReviewedField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(commentsField, { target: { value: "Delicious" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(screen.queryByText(/Minimum 1 star/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <MenuItemReviewForm />
      </Router>,
    );
    await screen.findByTestId("MenuItemReview-cancel");
    const cancelButton = screen.getByTestId("MenuItemReview-cancel");

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
