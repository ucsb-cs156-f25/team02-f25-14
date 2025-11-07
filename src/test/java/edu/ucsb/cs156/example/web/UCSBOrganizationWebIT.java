package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_ucsborganization() throws Exception {
    setupUser(true);

    page.getByText("UCSB Organization").click();

    page.getByText("Create UCSBOrganization").click();
    assertThat(page.getByText("Create New UCSBOrganization")).isVisible();
    // page.getByLabel("orgCode").fill("SKY");
    // page.getByLabel("orgTranslationShort").fill("SKYDIVING CLUB");
    // page.getByLabel("orgTranslation", new
    // Page.GetByLabelOptions().setExact(true)).fill("SKYDIVING CLUB AT UCSB");
    page.getByTestId("UCSBOrganizationForm-orgCode").fill("SKY");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("SKYDIVING CLUB");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("SKYDIVING CLUB AT UCSB");
    page.getByTestId("UCSBOrganizationForm-inactive").selectOption("false");
    // page.getByTestId("UCSBOrganizationForm-inactive").fill(false);
    // page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("SKYDIVING CLUB AT UCSB");
    // page.getByLabel("orgTranslation").fill("SKYDIVING CLUB AT UCSB");
    // page.getByLabel("Inactive").fill("false");

    page.getByTestId("UCSBOrganizationForm-submit").click();
    // page.getByText("Create").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslationShort"))
        .hasText("SKYDIVING CLUB");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit UCSBOrganization")).isVisible();
    page.getByTestId("UCSBOrganizationForm-inactive").selectOption("true");
    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-inactive")).hasText("true");

    page.getByTestId("UCSBOrganizationTable-cell-row-0-col-Delete-button").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-name")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_ucsborganization() throws Exception {
    setupUser(false);

    page.getByText("UCSB Organization").click();

    assertThat(page.getByText("Create UCSBOrganization")).not().isVisible();
    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-name")).not().isVisible();
  }
}
