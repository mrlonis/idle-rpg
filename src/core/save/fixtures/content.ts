/**
 * Stand-in content for the save specs.
 *
 * The repair pass checks a save against the characters a build actually ships, so it takes a
 * lookup and a level curve as arguments. These are the roster fixtures, re-exported rather than
 * duplicated: two copies of "what test content looks like" is two things to keep in step, and
 * the save specs and the roster specs benefit from asserting against the same characters.
 */
export {
  TEST_CHARACTERS,
  TEST_LEVEL_CURVE,
  TEST_ALPHA,
  TEST_BETA,
  TEST_GAMMA,
} from '../../roster/fixtures';
