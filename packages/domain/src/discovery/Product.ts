import { BusinessRuleViolation } from '../shared/DomainError';

export type ProductSource = 'KIWIFY' | 'HOTMART' | 'EDUZZ' | 'MONETIZZE' | 'HEROSPARK' | 'TICTO';

export interface ProductDossier {
  targetAudience: string;
  pains: string[];
  benefits: string[];
  objections: string[];
  triggers: string[];
  proofPoints: string[];
}

export interface ProductProps {
  id: string;
  source: ProductSource;
  externalId: string;
  name: string;
  niche: string;
  hotScore: number;
  dossier: ProductDossier;
  saturation: number;
  blocked: boolean;
  updatedAt: Date;
}

export class Product {
  private constructor(private readonly props: ProductProps) {}

  static reconstitute(props: ProductProps): Product {
    return new Product(props);
  }

  static create(props: Omit<ProductProps, 'hotScore' | 'blocked' | 'updatedAt'>): Product {
    if (props.saturation < 0 || props.saturation > 100)
      throw new BusinessRuleViolation('saturation must be 0–100');
    return new Product({ ...props, hotScore: 0, blocked: false, updatedAt: new Date() });
  }

  updateHotScore(score: number): Product {
    if (score < 0 || score > 100) throw new BusinessRuleViolation('hotScore 0–100');
    return new Product({ ...this.props, hotScore: score, updatedAt: new Date() });
  }

  block(): Product {
    return new Product({ ...this.props, blocked: true });
  }

  isSaturated(): boolean {
    return this.props.saturation > 80;
  }

  get id() { return this.props.id; }
  get source() { return this.props.source; }
  get externalId() { return this.props.externalId; }
  get name() { return this.props.name; }
  get niche() { return this.props.niche; }
  get hotScore() { return this.props.hotScore; }
  get dossier() { return this.props.dossier; }
  get saturation() { return this.props.saturation; }
  get blocked() { return this.props.blocked; }
  toProps(): ProductProps { return { ...this.props }; }
}
