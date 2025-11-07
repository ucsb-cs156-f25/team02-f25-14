import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import mockConsole from "tests/testutils/mockConsole";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

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

describe("UCSBOrganizationIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "UCSBOrganizationTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/ucsborganization/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create UCSBOrganization/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create UCSBOrganization/);
    expect(button).toHaveAttribute("href", "/ucsborganization/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three UCSBOrganizations correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/ucsborganization/all")
      .reply(200, ucsbOrganizationFixtures.threeUCSBOrganizations);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toHaveTextContent("ZPR");
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("SKY");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("OSLI");

    const createUCSBOrganizationButton = screen.queryByText(
      "Create UCSBOrganization",
    );
    expect(createUCSBOrganizationButton).not.toBeInTheDocument();

    const orgTranslationShort0 = screen.getByTestId(
      `${testId}-cell-row-0-col-orgTranslationShort`,
    );
    expect(orgTranslationShort0).toHaveTextContent("ZETA PHI RHO");

    const orgTranslationShort1 = screen.getByTestId(
      `${testId}-cell-row-1-col-orgTranslationShort`,
    );
    expect(orgTranslationShort1).toHaveTextContent("SKYDIVING CLUB");

    const orgTranslationShort2 = screen.getByTestId(
      `${testId}-cell-row-2-col-orgTranslationShort`,
    );
    expect(orgTranslationShort2).toHaveTextContent("STUDENT LIFE");

    const orgTranslation0 = screen.getByTestId(
      `${testId}-cell-row-0-col-orgTranslation`,
    );
    expect(orgTranslation0).toHaveTextContent("ZETA PHI RHO");

    const orgTranslation1 = screen.getByTestId(
      `${testId}-cell-row-1-col-orgTranslation`,
    );
    expect(orgTranslation1).toHaveTextContent("SKYDIVING CLUB AT UCSB");

    const orgTranslation2 = screen.getByTestId(
      `${testId}-cell-row-2-col-orgTranslation`,
    );
    expect(orgTranslation2).toHaveTextContent("OFFICE OF STUDENT LIFE");

    const inactive0 = screen.getByTestId(`${testId}-cell-row-0-col-inactive`);
    expect(inactive0).toHaveTextContent(false);

    const inactive1 = screen.getByTestId(`${testId}-cell-row-1-col-inactive`);
    expect(inactive1).toHaveTextContent(false);

    const inactive2 = screen.getByTestId(`${testId}-cell-row-2-col-inactive`);
    expect(inactive2).toHaveTextContent(false);

    // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
    expect(
      screen.queryByTestId(
        "UCSBOrganizationTable-cell-row-0-col-Delete-button",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("UCSBOrganization-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/ucsborganization/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/ucsborganization/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/ucsborganization/all")
      .reply(200, ucsbOrganizationFixtures.threeUCSBOrganizations);
    axiosMock
      .onDelete("/api/ucsborganization")
      .reply(200, "UCSBOrganization with orgCode ZPR was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ZPR");

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith(
        "UCSBOrganization with orgCode ZPR was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/ucsborganization");
    expect(axiosMock.history.delete[0].url).toBe("/api/ucsborganization");
    expect(axiosMock.history.delete[0].params).toEqual({ orgCode: "ZPR" });
  });
});
