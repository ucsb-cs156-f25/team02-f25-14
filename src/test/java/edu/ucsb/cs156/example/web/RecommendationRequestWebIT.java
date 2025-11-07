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
public class RecommendationRequestWebIT extends WebTestCase {
  @Test
  public void admin_user_can_create_edit_delete_RecommendationRequest() throws Exception {
    setupUser(true);

    page.getByText("Recommendation Requests").click();

    page.getByText("Create RecommendationRequest").click();
    assertThat(page.getByText("Create New Request")).isVisible();

    page.getByLabel("RequesterEmail").fill("tester1@ucsb.edu");
    page.getByLabel("ProfessorEmail").fill("tester2@ucsb.edu");
    page.getByLabel("Explanation").fill("Testing Explanation");
    page.getByLabel("DateRequested (iso format)").fill("2022-02-02T00:00");
    page.getByLabel("DateNeeded (iso format)").fill("2022-02-02T00:00");
    page.getByLabel("Done?").click();

    page.locator("button:has-text('Create')").click();

    assertThat(page.getByLabel("Explanation")).hasValue("Testing Explanation");

    page.getByTestId("RecommendationRequest-cell-row-0-col-Edit-button").click();
    assertThat(page.getByText("Edit Request")).isVisible();
    page.getByLabel("Explanation").fill("Testing Explanation 2");

    page.getByText("Update").click();

    assertThat(page.getByLabel("Explanation")).hasValue("Testing Explanation 2");

    page.getByTestId("RecommendationRequest-cell-row-0-col-Delete-button").click();

    assertThat(page.getByLabel("Explanation")).not().isVisible();
  }

  @Test
  public void regular_user_cannot_create_RecommendationRequest() throws Exception {
    setupUser(false);

    page.getByText("Recommendation Requests").click();

    assertThat(page.getByText("Create RecommendationRequest")).not().isVisible();
    assertThat(page.getByTestId("RecommendationRequest-cell-row-0-col-requesteremail"))
        .not()
        .isVisible();
  }
}
