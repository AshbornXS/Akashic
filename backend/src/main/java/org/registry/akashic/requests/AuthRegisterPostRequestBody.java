package org.registry.akashic.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRegisterPostRequestBody {
    private String name;
    private String username;
    private String password;
    private String role;
}
