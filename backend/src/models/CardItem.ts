export interface CardItem {
  userId: string
  deckId: string
  cardId: string
  createdAt: string
  frontside: CardItemContent
  backside: CardItemContent
}

export interface CardItemContent {
  description: string
  attachmentUrl: string
}
  