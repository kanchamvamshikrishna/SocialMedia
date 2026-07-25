package com.instagram;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.instagram.dto.CreateCommentRequest;
import com.instagram.dto.CreatePostRequest;
import com.instagram.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PostFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String registerAndGetToken(String username, String email) throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setUsername(username);
        register.setEmail(email);
        register.setPassword("supersecret123");

        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode json = objectMapper.readTree(body);
        return json.get("token").asText();
    }

    @Test
    void createPostThenLikeAndCommentUpdatesCounts() throws Exception {
        String token = registerAndGetToken("poster_user", "poster@example.com");

        CreatePostRequest createPost = new CreatePostRequest();
        createPost.setImageUrl("https://example.com/photo.jpg");
        createPost.setCaption("Hello world");

        String postBody = mockMvc.perform(post("/api/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createPost)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likeCount").value(0))
                .andExpect(jsonPath("$.commentCount").value(0))
                .andReturn().getResponse().getContentAsString();

        long postId = objectMapper.readTree(postBody).get("id").asLong();

        mockMvc.perform(post("/api/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(true))
                .andExpect(jsonPath("$.likeCount").value(1));

        // Toggling again un-likes it.
        mockMvc.perform(post("/api/posts/" + postId + "/like")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.liked").value(false))
                .andExpect(jsonPath("$.likeCount").value(0));

        CreateCommentRequest comment = new CreateCommentRequest();
        comment.setText("Nice shot!");

        mockMvc.perform(post("/api/posts/" + postId + "/comments")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(comment)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("Nice shot!"));

        mockMvc.perform(get("/api/posts/" + postId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.commentCount").value(1));
    }

    @Test
    void exploreFeedRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/posts/explore"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void exploreFeedIsReadableWhenAuthenticated() throws Exception {
        String token = registerAndGetToken("explorer_user", "explorer@example.com");

        mockMvc.perform(get("/api/posts/explore")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void creatingAPostWithoutAuthenticationIsRejected() throws Exception {
        CreatePostRequest createPost = new CreatePostRequest();
        createPost.setImageUrl("https://example.com/photo.jpg");

        mockMvc.perform(post("/api/posts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createPost)))
                .andExpect(status().isUnauthorized());
    }
}
