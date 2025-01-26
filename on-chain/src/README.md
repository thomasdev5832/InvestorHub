# Notes

Swap Facets
1. Simple Swap + Stake
    Uniswap Pools
        User has one token, just need to swap half for the second one
    Aave Pools
        User has an arbitrary token and wants to deposit tokenX
2. Multi Swap + Stake
    Uniswap Pools
        User has an arbitrary token and needs to swap it into the pair that will be staked
    Aave Pools
        No need, they accept only one token.

Stake Facets
1. Swap function `delegatecall()` to the specific pool
    - Payload needs to carrie an enum / or signature of function to redirect
        - If signature/selector, we need to check against allowed selectors before performing the call.
            Thinking... this is a great way to do it. We already have the `selector => address`, which means, it will not be complicated to implement.