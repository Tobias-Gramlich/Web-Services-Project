package skyjo.api.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
public class PlayfieldCardRequest extends AuthTokenRequest{
    private Integer cardIndex;
}
