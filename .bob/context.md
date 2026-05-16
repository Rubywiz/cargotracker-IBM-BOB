# LegacyLift — Bob context

## About this codebase
Eclipse Cargo Tracker — Jakarta EE 10 / Java 11, Payara 6, DDD architecture.
Four bounded contexts: booking, handling, routing, tracking.

## Goals
1. Analyse for modernisation risk
2. Generate JSON outputs for the risk dashboard
3. Demonstrate governed upgrade of the highest-risk context

## Output directory
All analysis outputs go to bob-outputs/

## Rules
- Human approval required before any source file is changed
- Log all actions via BobShell
