import {
  createTestUser,
  createTestPlace,
  createTestPlaceReview,
  cleanupDatabase,
} from "./dbHelpers.ts";

describe("Verify tests setup", () => {
  test("should connect to the test db", async () => {
    const { user, token } = await createTestUser();

    expect(user).toBeDefined();
    await cleanupDatabase();
  });
});
