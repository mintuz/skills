#!/usr/bin/env bats

SEED="$BATS_TEST_DIRNAME/../../../src/core/skills/creative-seed/scripts/seed.sh"

seed() { bash "$SEED" "$@"; }

@test "no arguments prints usage and exits 2" {
  run seed
  [ "$status" -eq 2 ]
  [[ "$output" == *"usage"* ]]
}

@test "the same label always prints the same string" {
  run seed checkout-concept/B
  [ "$status" -eq 0 ]
  first="$output"
  run seed checkout-concept/B
  [ "$output" = "$first" ]
}

@test "each label prints a different string" {
  a="$(seed checkout-concept/A)"
  b="$(seed checkout-concept/B)"
  reroll="$(seed checkout-concept/B/2)"
  [ "$a" != "$b" ]
  [ "$b" != "$reroll" ]
}

@test "the default string is 64 letters and digits" {
  run seed demo
  [ "$status" -eq 0 ]
  [ "${#output}" -eq 64 ]
  [[ "$output" =~ ^[A-Za-z0-9]+$ ]]
}

@test "a requested length spans several hash blocks" {
  run seed demo 500
  [ "$status" -eq 0 ]
  [ "${#output}" -eq 500 ]
  [[ "$output" =~ ^[A-Za-z0-9]+$ ]]
}

@test "a longer string extends the shorter one for the same label" {
  short="$(seed demo 64)"
  long="$(seed demo 200)"
  [ "${long:0:64}" = "$short" ]
}

@test "an invalid length exits 2" {
  for length in 0 abc -5 1025; do
    run seed demo "$length"
    [ "$status" -eq 2 ]
  done
}

@test "an empty label exits 2" {
  run seed ""
  [ "$status" -eq 2 ]
}

@test "a recorded label still prints the string it printed when recorded" {
  run seed demo 32
  [ "$output" = "2yFCISXjORozzR6oKtWACeaakvdhWREJ" ]
}
