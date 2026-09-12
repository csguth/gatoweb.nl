// Step definitions for tests/bdd/features/invite-intake.feature.
// Pure logic test: imports js/account/invite-intake.js directly, no DOM/no
// Supabase client — same pattern as client-invite-actions.steps.mjs.
import { Given, When, Then } from '@cucumber/cucumber';
import { world } from '../../bdd/support/world.mjs';
import { decideInviteIntake } from '../../../static/js/account/invite-intake.js';


function resetIntakeState() {
  world.intake = {
    hasInviteToken: false,
    sessionAlreadyExistedAtLoad: false,
    loggedOutSinceLoad: false,
    justAuthenticatedOnThisPage: false
  };
}

Given('there is no invite token', async () => {
  resetIntakeState();
  world.intake.hasInviteToken = false;
});

Given('an invite token is present', async () => {
  resetIntakeState();
  world.intake.hasInviteToken = true;
});

Given('no session exists yet', async () => {
  world.intake.sessionAlreadyExistedAtLoad = false;
});

Given('a session was already restored when the page loaded', async () => {
  world.intake.sessionAlreadyExistedAtLoad = true;
});

Given('the client just logged in or signed up on this very page', async () => {
  world.intake.justAuthenticatedOnThisPage = true;
});

Given('the client explicitly logged out since then', async () => {
  world.intake.loggedOutSinceLoad = true;
});

When('the invite intake decision is made', async () => {
  world.intakeDecision = decideInviteIntake(world.intake);
});

Then('the decision is {string}', async (expected) => {
  if (world.intakeDecision !== expected) {
    throw new Error(`Expected decision "${expected}" but got "${world.intakeDecision}"`);
  }
});
