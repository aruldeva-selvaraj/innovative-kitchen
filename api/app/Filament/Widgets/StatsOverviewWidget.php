<?php

namespace App\Filament\Widgets;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $totalProducts  = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $outOfStock     = Product::where('in_stock', false)->count();
        $featured       = Product::where('is_featured', true)->count();
        $categories     = Category::count();
        $brands         = Brand::count();

        return [
            Stat::make('Total Products', $totalProducts)
                ->description("{$activeProducts} active · {$outOfStock} out of stock")
                ->descriptionIcon('heroicon-m-cube')
                ->color('primary'),

            Stat::make('Featured Products', $featured)
                ->description('Shown on homepage & carousels')
                ->descriptionIcon('heroicon-m-star')
                ->color('warning'),

            Stat::make('Categories', $categories)
                ->description(Brand::count() . ' brands in catalogue')
                ->descriptionIcon('heroicon-m-tag')
                ->color('success'),

            Stat::make('Out of Stock', $outOfStock)
                ->description($outOfStock > 0 ? 'Action needed' : 'All in stock')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color($outOfStock > 0 ? 'danger' : 'success'),
        ];
    }
}
