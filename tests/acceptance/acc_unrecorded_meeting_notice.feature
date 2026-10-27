Feature: Unrecorded meeting notice

  Scenario: Notice appears in an unrecorded meeting
    Given the extension is running on a Meet page
    When I am admitted to a meeting where Gemini is not taking notes
    Then I see the unrecorded notice immediately

  Scenario: No notice in a recorded meeting
    Given the extension is running on a Meet page
    When I am admitted to a meeting that is being recorded
    Then I see no notice

  Scenario: Recorded status shown before admission
    Given the extension is running on a Meet page
    When the recorded status shows before admission and then I am admitted
    Then I see no notice

  Scenario: Dismissing the notice
    Given the extension is running on a Meet page
    And the unrecorded notice is showing
    When I dismiss the notice
    Then I see no notice
    And the Leave call button is still present

  Scenario: Rejoining shows the notice again
    Given the extension is running on a Meet page
    And the unrecorded notice is showing
    When I leave and rejoin an unrecorded meeting
    Then I see the unrecorded notice immediately

  Scenario: Rejoining within five seconds restarts the wait
    Given the extension is running on a Meet page
    When I join with no notes status, leave after 3 seconds and rejoin
    Then the notice is absent until 5 seconds after the rejoin

  Scenario: Leaving removes the notice
    Given the extension is running on a Meet page
    And the unrecorded notice is showing
    When I leave the meeting
    Then I see no notice

  Scenario: Meeting that shows no notes status
    Given the extension is running on a Meet page
    When I join with no notes status
    Then the notice is absent until 5 seconds after the rejoin

  Scenario: No notice while waiting to be let in
    Given the extension is running on a Meet page
    When 10 seconds pass without admission
    Then I see no notice

  Scenario: Recording starting later changes nothing
    Given the extension is running on a Meet page
    And the unrecorded notice is showing
    When recording starts
    Then the unrecorded notice is still showing

  Scenario: Recording stopping later changes nothing
    Given the extension is running on a Meet page
    And I am in a recorded meeting
    When recording stops
    Then I see no notice
