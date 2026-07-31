<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryResource\Pages;
use App\Models\Category;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Category Details')->schema([
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
                        ->unique(Category::class, 'slug', ignoreRecord: true),
                ]),
                Forms\Components\Select::make('parent_id')
                    ->label('Parent Category')
                    ->options(fn () => Category::whereNull('parent_id')->orderBy('name')->pluck('name', 'id'))
                    ->placeholder('— Top-level category —')
                    ->searchable()
                    ->nullable(),
                Forms\Components\Textarea::make('description')
                    ->rows(2)
                    ->maxLength(500),
                Forms\Components\Grid::make(2)->schema([
                    Forms\Components\TextInput::make('icon')
                        ->label('Icon (emoji or class)')
                        ->placeholder('🍳')
                        ->maxLength(20),
                    Forms\Components\TextInput::make('sort_order')
                        ->label('Sort Order')
                        ->integer()
                        ->default(0),
                ]),
                Forms\Components\FileUpload::make('image')
                    ->label('Category Image')
                    ->image()
                    ->disk('public')
                    ->directory('categories')
                    ->maxSize(1024),
                Forms\Components\Toggle::make('is_featured')
                    ->label('Featured on Homepage')
                    ->default(false)
                    ->inline(false),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('icon')
                    ->label('')
                    ->alignCenter()
                    ->width(40),
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),
                Tables\Columns\TextColumn::make('parent.name')
                    ->label('Parent')
                    ->badge()
                    ->placeholder('Top-level'),
                Tables\Columns\TextColumn::make('slug')
                    ->searchable()
                    ->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('products_count')
                    ->label('Products')
                    ->counts('products')
                    ->alignCenter()
                    ->sortable(),
                Tables\Columns\IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean()
                    ->alignCenter(),
                Tables\Columns\TextColumn::make('sort_order')
                    ->label('Sort')
                    ->sortable()
                    ->alignCenter(),
            ])
            ->defaultSort('sort_order')
            ->filters([
                Tables\Filters\SelectFilter::make('parent_id')
                    ->label('Parent')
                    ->options(fn () => Category::whereNull('parent_id')->pluck('name', 'id'))
                    ->placeholder('All'),
                Tables\Filters\TernaryFilter::make('is_featured'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListCategories::route('/'),
            'create' => Pages\CreateCategory::route('/create'),
            'edit'   => Pages\EditCategory::route('/{record}/edit'),
        ];
    }
}
