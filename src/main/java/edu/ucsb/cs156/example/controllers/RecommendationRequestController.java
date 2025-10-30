package edu.ucsb.cs156.example.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.errors.EntityNotFoundException;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** This is a REST controller for UCSBDates */
@Tag(name = "RecommendationRequest")
@RequestMapping("/api/recommendationrequest")
@RestController
@Slf4j
public class RecommendationRequestController extends ApiController {

  @Autowired RecommendationRequestRepository recommendationrequestRepository;

  @Operation(summary = "List all ucsb requests")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/all")
  public Iterable<RecommendationRequest> allRecommendationRequests() {
    Iterable<RecommendationRequest> requests = recommendationrequestRepository.findAll();
    return requests;
  }

  /**
   * Create a new request
   *
   * @param requesterEmail
   * @param professorEmail
   * @param daterequested
   * @param dateneeded
   * @param done
   * @return the saved request
   */
  @Operation(summary = "Create a new request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/post")
  public RecommendationRequest postRecommendationRequest(
      @Parameter(name = "requesterEmail") @RequestParam String requesterEmail,
      @Parameter(name = "professorEmail") @RequestParam String professorEmail,
      @Parameter(name = "explanation") @RequestParam String explanation,
      @Parameter(
              name = "daterequested",
              description =
                  "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)")
          @RequestParam("dateRequested")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime daterequested,
      @Parameter(
              name = "dateneeded",
              description =
                  "date (in iso format, e.g. YYYY-mm-ddTHH:MM:SS; see https://en.wikipedia.org/wiki/ISO_8601)")
          @RequestParam("dateNeeded")
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
          LocalDateTime dateneeded,
      @Parameter(name = "done") @RequestParam boolean done)
      throws JsonProcessingException {

    // For an explanation of @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    // See: https://www.baeldung.com/spring-date-parameters

    log.info("localDateTime={}", daterequested);
    log.info("localDateTime={}", dateneeded);

    RecommendationRequest request = new RecommendationRequest();
    request.setRequesterEmail(requesterEmail);
    request.setProfessorEmail(professorEmail);
    request.setExplanation(explanation);
    request.setDateRequested(daterequested);
    request.setDateNeeded(dateneeded);
    request.setDone(done);

    RecommendationRequest savedRecommendationRequest =
        recommendationrequestRepository.save(request);

    return savedRecommendationRequest;
  }

  /**
   * Get a single date by id
   *
   * @param id the id of the date
   * @return a UCSBDate
   */
  @Operation(summary = "Get a request")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("")
  public RecommendationRequest getById(@Parameter(name = "id") @RequestParam Long id) {
    RecommendationRequest request =
        recommendationrequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    return request;
  }

  @Operation(summary = "Update a single request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PutMapping("")
  public RecommendationRequest updateRecommendationRequest(
      @Parameter(name = "id") @RequestParam Long id,
      @RequestBody @Valid RecommendationRequest incoming) {

    RecommendationRequest request =
        recommendationrequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    request.setRequesterEmail(incoming.getRequesterEmail());
    request.setProfessorEmail(incoming.getProfessorEmail());
    request.setExplanation(incoming.getExplanation());
    request.setDateRequested(incoming.getDateRequested());
    request.setDateNeeded(incoming.getDateNeeded());
    request.setDone(incoming.getDone());

    recommendationrequestRepository.save(request);

    return request;
  }

  @Operation(summary = "Delete a request")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @DeleteMapping("")
  public Object deleteRequest(@Parameter(name = "id") @RequestParam Long id) {
    RecommendationRequest request =
        recommendationrequestRepository
            .findById(id)
            .orElseThrow(() -> new EntityNotFoundException(RecommendationRequest.class, id));

    recommendationrequestRepository.delete(request);
    return genericMessage("request with id %s deleted".formatted(id));
  }
}
