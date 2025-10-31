package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.UCSBDiningCommonsMenuItem;
import edu.ucsb.cs156.example.repositories.UCSBDiningCommonsMenuItemRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = UCSBDiningCommonsMenuItemController.class)
@Import(TestConfig.class)
public class UCSBDiningCommonsMenuItemControllerTests extends ControllerTestCase {

  @MockBean UCSBDiningCommonsMenuItemRepository ucsbDiningCommonsMenuItemRepository;

  @MockBean UserRepository userRepository;

  // Authorization tests for /api/ucsbdiningcommonsmenuitem/admin/all

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc
        .perform(get("/api/ucsbdiningcommonsmenuitem/all"))
        .andExpect(status().is(403)); // logged out users can't get all
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc
        .perform(get("/api/ucsbdiningcommonsmenuitem/all"))
        .andExpect(status().is(200)); // logged
  }

  @Test
  public void logged_out_users_cannot_get_by_id() throws Exception {
    mockMvc
        .perform(get("/api/ucsbdiningcommonsmenuitem?id=7"))
        .andExpect(status().is(403)); // logged out users can't get by id
  }

  // Authorization tests for /api/ucsbdiningcommonsmenuitem/post
  // (Perhaps should also have these for put and delete)

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc.perform(post("/api/ucsbdiningcommonsmenuitem/post")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(post("/api/ucsbdiningcommonsmenuitem/post"))
        .andExpect(status().is(403)); // only admins can post
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_cannot_get_by_invalid_id() throws Exception {
    mockMvc.perform(get("/api/ucsbdiningcommonsmenuitem?id=1000")).andExpect(status().is(404));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_menuitem() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Baked Pesto Pasta with Chicken")
            .station("Entree Specials")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.save(eq(ucsbDiningCommonsMenuItem)))
        .thenReturn(ucsbDiningCommonsMenuItem);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/ucsbdiningcommonsmenuitem/post?diningCommonsCode=ortega&name=Baked Pesto Pasta with Chicken&station=Entree Specials")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).save(ucsbDiningCommonsMenuItem);
    String expectedJson = mapper.writeValueAsString(ucsbDiningCommonsMenuItem);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_by_id() throws Exception {

    // arrange
    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Baked Pesto Pasta with Chicken")
            .station("Entree Specials")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(7L)))
        .thenReturn(Optional.of(ucsbDiningCommonsMenuItem));

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/ucsbdiningcommonsmenuitem?id=7"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(eq(7L));
    String expectedJson = mapper.writeValueAsString(ucsbDiningCommonsMenuItem);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_menuitems() throws Exception {

    // arrange

    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem1 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Baked Pesto Pasta with Chicken")
            .station("Entree Specials")
            .build();

    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem2 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Tofu Banh Mi Sandwich (v)")
            .station("Entree Specials")
            .build();

    ArrayList<UCSBDiningCommonsMenuItem> expectedDiningCommonsMenuItem = new ArrayList<>();
    expectedDiningCommonsMenuItem.addAll(
        Arrays.asList(ucsbDiningCommonsMenuItem1, ucsbDiningCommonsMenuItem2));

    when(ucsbDiningCommonsMenuItemRepository.findAll()).thenReturn(expectedDiningCommonsMenuItem);

    // act
    MvcResult response =
        mockMvc
            .perform(get("/api/ucsbdiningcommonsmenuitem/all"))
            .andExpect(status().isOk())
            .andReturn();

    // assert

    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findAll();
    String expectedJson = mapper.writeValueAsString(expectedDiningCommonsMenuItem);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_edit_an_existing_ucsbdiningcommonsmenuitem() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItemOrig =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Baked Pesto Pasta with Chicken")
            .station("Entree Specials")
            .build();

    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItemEdited =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("portola")
            .name("Cream of Broccoli Soup (v)")
            .station("Greens & Grains")
            .build();

    String requestBody = mapper.writeValueAsString(ucsbDiningCommonsMenuItemEdited);

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(67L)))
        .thenReturn(Optional.of(ucsbDiningCommonsMenuItemOrig));

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsbdiningcommonsmenuitem?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(67L);
    verify(ucsbDiningCommonsMenuItemRepository, times(1))
        .save(ucsbDiningCommonsMenuItemEdited); // should be saved with correct user
    String responseString = response.getResponse().getContentAsString();
    assertEquals(requestBody, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_cannot_edit_ucsbdiningcommonsmenuitem_that_does_not_exist() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem ucsbEditedDiningCommonsMenuItem =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Baked Pesto Pasta with Chicken")
            .station("Entree Specials")
            .build();

    String requestBody = mapper.writeValueAsString(ucsbEditedDiningCommonsMenuItem);

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(67L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(
                put("/api/ucsbdiningcommonsmenuitem?id=67")
                    .contentType(MediaType.APPLICATION_JSON)
                    .characterEncoding("utf-8")
                    .content(requestBody)
                    .with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(67L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("UCSBDiningCommonsMenuItem with id 67 not found", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_delete_a_menu_item() throws Exception {
    // arrange

    UCSBDiningCommonsMenuItem ucsbDiningCommonsMenuItem1 =
        UCSBDiningCommonsMenuItem.builder()
            .diningCommonsCode("ortega")
            .name("Baked Pesto Pasta with Chicken")
            .station("Entree Specials")
            .build();

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(15L)))
        .thenReturn(Optional.of(ucsbDiningCommonsMenuItem1));

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsbdiningcommonsmenuitem?id=15").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(15L);
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).delete(any());

    Map<String, Object> json = responseToJson(response);
    assertEquals("UCSBDiningCommonsMenuItem with id 15 deleted", json.get("message"));
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_tries_to_delete_non_existant_ucsbdate_and_gets_right_error_message()
      throws Exception {
    // arrange

    when(ucsbDiningCommonsMenuItemRepository.findById(eq(15L))).thenReturn(Optional.empty());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/ucsbdiningcommonsmenuitem?id=15").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    // assert
    verify(ucsbDiningCommonsMenuItemRepository, times(1)).findById(15L);
    Map<String, Object> json = responseToJson(response);
    assertEquals("UCSBDiningCommonsMenuItem with id 15 not found", json.get("message"));
  }
}
