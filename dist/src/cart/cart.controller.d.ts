import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto';
export declare class CartController {
    findAll(): string;
    add(dto: AddToCartDto): string;
    update(id: string, dto: UpdateCartItemDto): string;
    remove(dto: RemoveFromCartDto): string;
}
