package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Articles;
import edu.ucsb.cs156.example.repositories.ArticlesRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticlesRepository articlesRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_article_by_id_when_it_exists() throws Exception {
    // arrange
    LocalDateTime dateAdded = LocalDateTime.parse("2022-01-03T00:00:00");
    Articles savedArticle =
        articlesRepository.save(
            Articles.builder()
                .title("Test Article")
                .url("https://www.example.com")
                .explanation("Sample explanation")
                .email("test@ucsb.edu")
                .dateAdded(dateAdded)
                .build());

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/articles?id=" + savedArticle.getId()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(savedArticle);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_user_can_post_a_new_article() throws Exception {
    // arrange
    LocalDateTime dateAdded = LocalDateTime.parse("2022-01-03T00:00:00");

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/articles/post")
                    .param("title", "New Article")
                    .param("url", "https://www.example.com")
                    .param("explanation", "Sample explanation")
                    .param("email", "test@ucsb.edu")
                    .param("dateAdded", "2022-01-03T00:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    Articles responseArticle = mapper.readValue(responseString, Articles.class);

    Articles savedArticle =
        articlesRepository
            .findById(responseArticle.getId())
            .orElseThrow(() -> new IllegalStateException("Article was not persisted"));

    assertEquals("New Article", savedArticle.getTitle());
    assertEquals("https://www.example.com", savedArticle.getUrl());
    assertEquals("Sample explanation", savedArticle.getExplanation());
    assertEquals("test@ucsb.edu", savedArticle.getEmail());
    assertEquals(dateAdded, savedArticle.getDateAdded());

    String expectedJson = mapper.writeValueAsString(savedArticle);
    assertEquals(expectedJson, responseString);
  }
}
