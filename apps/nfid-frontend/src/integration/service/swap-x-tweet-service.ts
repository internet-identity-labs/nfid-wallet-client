class SwapXTweetService {
    public async tweet(
        principalId: string,
        transactionId: string,
    ): Promise<void> {
        console.log("Send tweet", principalId, transactionId)
        await fetch(AWS_X_TWEET, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ principalId, transactionId }),
        })
    }
}

export const swapXTweetService = new SwapXTweetService()
