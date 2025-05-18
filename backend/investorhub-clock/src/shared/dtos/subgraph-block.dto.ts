export class SubgraphBlockDto {
  number: number;
  hash: string;
}

export class SubgraphMetaDto {
  block: SubgraphBlockDto;
}

export class SubgraphBlockResponseDto {
  _meta: SubgraphMetaDto;
} 