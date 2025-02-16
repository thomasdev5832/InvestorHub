# Makefile for Foundry project

# Load environment variables from .env file
include .env
export $(shell sed 's/=.*//' .env)

# Initialize forked network with anvil
.PHONY: dev
dev:
	anvil --fork-url $(FORK_URL)

# Build contracts
.PHONY: build
build:
	forge clean && forge install && forge build

# Execute tests
.PHONY: test
test:
	forge test

# Execute Forked tests
.PHONY: forked_test
forked_test:
	forge test --match-path test/ForkedTests/DiamondForked.t.sol -vv
	
# Deploy contract
.PHONY: deploy_local
deploy_local:
	forge script script/DeployInit.s.sol --rpc-url localhost --broadcast --unlocked --sender $(ADMIN_LOCALNET_PUBLIC_KEY)