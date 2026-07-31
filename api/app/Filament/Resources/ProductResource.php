<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $navigationIcon = 'heroicon-o-cube';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Tabs::make('Product')
                ->tabs([
                    // ── General ────────────────────────────────────────
                    Forms\Components\Tabs\Tab::make('General')
                        ->icon('heroicon-m-information-circle')
                        ->schema([
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('name')
                                    ->required()
                                    ->maxLength(255)
                                    ->live(onBlur: true)
                                    ->afterStateUpdated(fn (Forms\Set $set, ?string $state) =>
                                        $set('slug', Str::slug($state ?? ''))
                                    ),
                                Forms\Components\TextInput::make('slug')
                                    ->required()
                                    ->maxLength(255)
                                    ->unique(Product::class, 'slug', ignoreRecord: true),
                            ]),
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('sku')
                                    ->label('SKU')
                                    ->maxLength(100)
                                    ->unique(Product::class, 'sku', ignoreRecord: true),
                                Forms\Components\Select::make('category_id')
                                    ->label('Category')
                                    ->options(fn () => Category::orderBy('name')->pluck('name', 'id'))
                                    ->searchable()
                                    ->preload()
                                    ->required(),
                            ]),
                            Forms\Components\Select::make('brand_id')
                                ->label('Brand')
                                ->options(fn () => Brand::orderBy('name')->pluck('name', 'id'))
                                ->searchable()
                                ->preload()
                                ->required(),
                            Forms\Components\Textarea::make('short_description')
                                ->rows(2)
                                ->maxLength(500),
                            Forms\Components\RichEditor::make('description')
                                ->toolbarButtons([
                                    'bold', 'italic', 'underline',
                                    'bulletList', 'orderedList',
                                    'h2', 'h3',
                                    'link', 'blockquote',
                                ]),
                        ]),

                    // ── Pricing & Stock ────────────────────────────────
                    Forms\Components\Tabs\Tab::make('Pricing & Stock')
                        ->icon('heroicon-m-currency-dollar')
                        ->schema([
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('price')
                                    ->required()
                                    ->numeric()
                                    ->prefix('AED')
                                    ->minValue(0),
                                Forms\Components\TextInput::make('original_price')
                                    ->label('Original Price (before discount)')
                                    ->numeric()
                                    ->prefix('AED')
                                    ->minValue(0)
                                    ->helperText('Leave empty if no discount'),
                            ]),
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('stock_qty')
                                    ->label('Stock Quantity')
                                    ->required()
                                    ->integer()
                                    ->default(0)
                                    ->minValue(0),
                                Forms\Components\Toggle::make('in_stock')
                                    ->label('In Stock')
                                    ->default(true)
                                    ->inline(false),
                            ]),
                        ]),

                    // ── Images ─────────────────────────────────────────
                    Forms\Components\Tabs\Tab::make('Images')
                        ->icon('heroicon-m-photo')
                        ->schema([
                            Forms\Components\FileUpload::make('thumbnail')
                                ->label('Thumbnail Image (400×400)')
                                ->image()
                                ->disk('public')
                                ->directory('products')
                                ->imageEditor()
                                ->imageEditorAspectRatios(['1:1'])
                                ->maxSize(2048)
                                ->helperText('Main product image. Upload a square image for best results.'),
                            Forms\Components\FileUpload::make('images')
                                ->label('Additional Images (Gallery)')
                                ->image()
                                ->disk('public')
                                ->directory('products')
                                ->multiple()
                                ->reorderable()
                                ->maxFiles(8)
                                ->maxSize(2048)
                                ->helperText('Up to 8 additional images for the product gallery.'),
                        ]),

                    // ── Specifications ─────────────────────────────────
                    Forms\Components\Tabs\Tab::make('Specifications')
                        ->icon('heroicon-m-list-bullet')
                        ->schema([
                            Forms\Components\Repeater::make('specs')
                                ->label('Technical Specifications')
                                ->schema([
                                    Forms\Components\Grid::make(2)->schema([
                                        Forms\Components\TextInput::make('label')
                                            ->label('Spec Name')
                                            ->placeholder('e.g. Dimensions')
                                            ->required(),
                                        Forms\Components\TextInput::make('value')
                                            ->label('Spec Value')
                                            ->placeholder('e.g. 600 x 400 x 850 mm')
                                            ->required(),
                                    ]),
                                ])
                                ->addActionLabel('Add Specification')
                                ->reorderable()
                                ->collapsible()
                                ->defaultItems(0),
                            Forms\Components\TagsInput::make('tags')
                                ->label('Search Tags')
                                ->placeholder('Add tag and press Enter')
                                ->helperText('Keywords that help customers find this product'),
                        ]),

                    // ── Settings ───────────────────────────────────────
                    Forms\Components\Tabs\Tab::make('Settings')
                        ->icon('heroicon-m-cog-6-tooth')
                        ->schema([
                            Forms\Components\Grid::make(3)->schema([
                                Forms\Components\Toggle::make('is_active')
                                    ->label('Published')
                                    ->default(true)
                                    ->inline(false)
                                    ->helperText('Visible on the website'),
                                Forms\Components\Toggle::make('is_featured')
                                    ->label('Featured')
                                    ->default(false)
                                    ->inline(false)
                                    ->helperText('Show on homepage'),
                                Forms\Components\Toggle::make('is_new')
                                    ->label('New Arrival')
                                    ->default(false)
                                    ->inline(false)
                                    ->helperText('Show "New" badge'),
                            ]),
                            Forms\Components\Grid::make(2)->schema([
                                Forms\Components\TextInput::make('rating')
                                    ->numeric()
                                    ->default(4.5)
                                    ->minValue(0)
                                    ->maxValue(5)
                                    ->step(0.1),
                                Forms\Components\TextInput::make('review_count')
                                    ->label('Review Count')
                                    ->integer()
                                    ->default(0)
                                    ->minValue(0),
                            ]),
                        ]),
                ])
                ->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail')
                    ->label('')
                    ->size(56)
                    ->disk('public'),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium')
                    ->description(fn (Product $r) => $r->sku ?? ''),
                Tables\Columns\TextColumn::make('category.name')
                    ->label('Category')
                    ->badge()
                    ->sortable(),
                Tables\Columns\TextColumn::make('brand.name')
                    ->label('Brand')
                    ->sortable(),
                Tables\Columns\TextColumn::make('price')
                    ->money('AED')
                    ->sortable(),
                Tables\Columns\TextColumn::make('stock_qty')
                    ->label('Stock')
                    ->sortable()
                    ->alignCenter(),
                Tables\Columns\IconColumn::make('in_stock')
                    ->label('In Stock')
                    ->boolean()
                    ->alignCenter(),
                Tables\Columns\IconColumn::make('is_active')
                    ->label('Live')
                    ->boolean()
                    ->alignCenter(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean()
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime('d M Y')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('category')
                    ->relationship('category', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\SelectFilter::make('brand')
                    ->relationship('brand', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Published'),
                Tables\Filters\TernaryFilter::make('in_stock')
                    ->label('In Stock'),
                Tables\Filters\TernaryFilter::make('is_featured')
                    ->label('Featured'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                    Tables\Actions\BulkAction::make('activate')
                        ->label('Set Active')
                        ->icon('heroicon-m-check-circle')
                        ->action(fn ($records) => $records->each->update(['is_active' => true]))
                        ->deselectRecordsAfterCompletion(),
                    Tables\Actions\BulkAction::make('deactivate')
                        ->label('Set Inactive')
                        ->icon('heroicon-m-x-circle')
                        ->action(fn ($records) => $records->each->update(['is_active' => false]))
                        ->deselectRecordsAfterCompletion(),
                ]),
            ])
            ->emptyStateHeading('No products yet')
            ->emptyStateDescription('Create your first product to get started.')
            ->emptyStateIcon('heroicon-o-cube');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'edit'   => Pages\EditProduct::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::count();
    }
}
