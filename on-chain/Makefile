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
	forge build

# Execute tests
.PHONY: test
test:
	forge test

# Deploy contract
.PHONY: deploy
deploy:
	forge script script/Deploy.s.sol:Deploy --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY)