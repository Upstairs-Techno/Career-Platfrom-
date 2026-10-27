package com.upstairstechno.util;

import java.time.Year;

/**
 * Generates human-readable, sequential-looking application IDs such as
 * OJT-2026-00001 / INT-2026-00001. The numeric part is derived from the
 * underlying database sequence value passed in by the caller so IDs stay
 * unique even under concurrent submissions.
 */
public class ApplicationIdGenerator {

    public static String generate(String prefix, long sequenceValue) {
        int year = Year.now().getValue();
        return String.format("%s-%d-%05d", prefix, year, sequenceValue);
    }
}
