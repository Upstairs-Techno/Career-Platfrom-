package com.upstairstechno.dto;

import com.upstairstechno.entity.OjtTrack;
import com.upstairstechno.entity.TrainingMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class OjtApplicationRequest extends StudentApplicationRequest {

    @NotNull(message = "OJT duration is required")
    private Integer durationWeeks;

    @NotNull(message = "Training mode is required")
    private TrainingMode trainingMode;

    @NotNull(message = "Training track is required")
    private OjtTrack track;
}
