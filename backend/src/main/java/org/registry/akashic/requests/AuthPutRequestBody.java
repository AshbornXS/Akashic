package org.registry.akashic.requests;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthPutRequestBody {
    private String name;
    private String username;
    private String password;
    private byte[] profilePic;
}