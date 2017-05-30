# dixitOnline
This is a web app implementation of the popular game [Dixit](https://boardgamegeek.com/boardgame/39856/dixit).

## Basic Premise
Using a deck of cards illustrated with dreamlike images, players select cards that match a title suggested by the **storyteller**, and attempt to guess which card the **storyteller** selected.

## Gameplay
### The storyteller
One player is the **storyteller** for the turn. He selects one of the six cards in his *hand*. From this, he makes up a sentence and submits it to the other players. This sentence is referred to as the **story**.

#### The Story
The **story** can take different forms: it can be made of one or more words. The **story** can either be invented or be inspired from an existing work of art *(poetry or song sample, movie title, proverb, etc).*

### Card Selection
The other players select one of their six cards that they think best matches the **story** made by the **storyteller**.

### The Vote
All cards selected, including the **storyteller**'s, will be displayed in a random order for all players to see. The goal of the other players is to determine which card is from the storyteller. Each player (except the **storyteller**, of course) will now vote for which card they believe belongs to the **storyteller**. Players are prohibted from voting for their own card.

### Scoring
- If all players have voted for the **storyteller**'s card, or if none have, then the **storyteller** doesn't score any points and everyone else scores 2 points.
- In any other case, the **storyteller** scores 3 points and so do the players who voted for his card.
- Each player, other than the **storyteller**, scores one point for each vote their card recieved.

### End of Round
Each player will be dealt a new card to bring their *hand* back to six. The role of **storyteller** will rotate to the next player in order.

### Game End
The game ends after 10 rounds of play have been completed. The player(s) with the highest score total win!

## Tips
If a **story** describes the card too precisely, all the players will easily find it, and thus the **storyteller** will not score any points.

If a **story** describes the card too vaguely, it is quite likely that nobody will vote for the **storyteller**'s card, and again he will score no points.

The challenge for the **storyteller** is to find a **story** that is neither too descriptive, nor too abstract. This allows for a chance that some, but not all players vote for it.

At the beginning, this can be fairly hard to achieve, but you'll see that the inspiration comes more easily after a few rounds.

## APIs
We used three APIs for this implementation.
1. [Firebase - Real Time Database](https://firebase.google.com/)
2. [Cloudinary Image Management](http://cloudinary.com/)
3. [Adorable.io avatars](https://github.com/adorableio/avatars-api)

## Libraries & Frameworks
We used [materialize](http://materializecss.com/) framework for layout and simple visuals.
For card, avatar, and scoring animations we used [animate.css](https://daneden.github.io/animate.css/)