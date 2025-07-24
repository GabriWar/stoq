'use client'
import Image from "next/image";
import { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Property Interest component for expressing interest
export function PropertyInterest({ property, onInterestChange }) {
  const [interested, setInterested] = useState(false);

  const handleInterestToggle = () => {
    const newInterest = !interested;
    setInterested(newInterest);
    onInterestChange && onInterestChange(newInterest);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
      <Button 
        onClick={handleInterestToggle}
        className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
          interested 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {interested ? '✓ Tenho Interesse' : 'Tenho Interesse'}
      </Button>
    </div>
  );
}

export default function Home() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [interestedProperties, setInterestedProperties] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('stoq')
        .select('*')
        .order('id', { ascending: false })

      if (error) {
        console.error('Erro ao buscar imóveis:', error)
        // Create sample data if table doesn't exist
        setSampleProperties()
      } else {
        setProperties(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
      setSampleProperties()
    } finally {
      setLoading(false)
    }
  }

  const setSampleProperties = () => {
    const sampleProperties = [
      {
        id: 1,
        name: 'Casa em Condomínio Fechado',
        type: 'casa',
        price: 850000,
        location: 'Cidade Nobre, Ipatinga/MG',
        bedrooms: 4,
        bathrooms: 3,
        area: 280,
        description: 'Linda casa em condomínio fechado com área de lazer completa',
        featured: true,
        qty: 1
      },
      {
        id: 2,
        name: 'Apartamento Centro',
        type: 'apartamento',
        price: 450000,
        location: 'Centro, Ipatinga/MG',
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        description: 'Apartamento moderno no centro da cidade',
        featured: true,
        qty: 1
      },
      {
        id: 3,
        name: 'Casa com Piscina',
        type: 'casa',
        price: 680000,
        location: 'Bom Retiro, Ipatinga/MG',
        bedrooms: 3,
        bathrooms: 2,
        area: 220,
        description: 'Casa espaçosa com piscina e área gourmet',
        featured: false,
        qty: 1
      }
    ]
    setProperties(sampleProperties)
  }

  const addSampleHouse = async () => {
    const sampleHouse = {
      name: 'Casa Familiar Modelo',
      type: 'casa',
      price: 750000,
      location: 'Bethânia, Ipatinga/MG',
      bedrooms: 3,
      bathrooms: 2,
      area: 200,
      description: 'Casa ideal para família com quintal amplo e garagem',
      featured: false,
      qty: 1,
      barcode: '123456789',
      lote: new Date(),
      update: new Date()
    }

    try {
      const { data, error } = await supabase
        .from('stoq')
        .insert([sampleHouse])
        .select()

      if (error) {
        console.error('Erro ao adicionar casa:', error)
        alert('Erro ao adicionar casa de exemplo')
      } else {
        alert('Casa de exemplo adicionada com sucesso!')
        fetchProperties()
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao adicionar casa de exemplo')
    }
  }

  const handleInterestChange = (propertyId, interested) => {
    if (interested) {
      setInterestedProperties([...interestedProperties, propertyId])
    } else {
      setInterestedProperties(interestedProperties.filter(id => id !== propertyId))
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || property.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">🏠 Guerrinha Imóveis</h1>
            <div className="flex items-center space-x-6">
              <span className="text-sm">📞 (31) 99690-1851</span>
              <span className="text-sm">📧 guerrinhaimoveis@hotmail.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Encontre seu imóvel dos sonhos</h2>
          <p className="text-xl mb-8">O melhor investimento da sua vida está aqui!</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Buscar por localização ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-gray-800"
              />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border rounded-lg text-gray-800"
              >
                <option value="all">Todos os tipos</option>
                <option value="casa">Casas</option>
                <option value="apartamento">Apartamentos</option>
              </select>
              <Button className="bg-blue-600 hover:bg-blue-700">
                🔍 Buscar
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">O que você está procurando?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-4">🏠</div>
              <h4 className="text-2xl font-bold mb-2 text-gray-800">CASAS</h4>
              <p className="text-gray-600 mb-4">Encontre a casa perfeita para sua família</p>
              <Button 
                onClick={() => setFilterType('casa')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Casas
              </Button>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="text-6xl mb-4">🏢</div>
              <h4 className="text-2xl font-bold mb-2 text-gray-800">APARTAMENTOS</h4>
              <p className="text-gray-600 mb-4">Apartamentos modernos no centro da cidade</p>
              <Button 
                onClick={() => setFilterType('apartamento')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver Apartamentos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">
            {filterType === 'all' ? 'Destaques de Venda' : 
             filterType === 'casa' ? 'Casas Disponíveis' : 'Apartamentos Disponíveis'}
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Carregando imóveis...</p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-600 text-lg">
                Nenhum imóvel encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <div key={property.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  {/* Property Image */}
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <span className="text-6xl">
                      {property.type === 'casa' ? '🏠' : '🏢'}
                    </span>
                  </div>

                  {/* Property Details */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        property.featured ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {property.featured ? 'DESTAQUE' : property.type.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">#{property.id}</span>
                    </div>

                    <h4 className="text-xl font-bold mb-2 text-gray-800">{property.name}</h4>
                    <p className="text-gray-600 mb-3">{property.description}</p>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-gray-600 mb-1">
                        <span className="mr-2">📍</span>
                        <span className="text-sm">{property.location}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>🛏️ {property.bedrooms} quartos</span>
                        <span>🚿 {property.bathrooms} banheiros</span>
                        <span>📐 {property.area}m²</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-green-600">
                        R$ {property.price.toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <PropertyInterest 
                      property={property}
                      onInterestChange={(interested) => handleInterestChange(property.id, interested)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">CONTATO</h3>
              <div className="space-y-2">
                <p>📍 Rua John Kennedy, 141, Cidade Nobre - Ipatinga/MG</p>
                <p>📧 guerrinhaimoveis@hotmail.com</p>
                <p>📞 (31) 99690-1851 - Venda</p>
                <p>📞 (31) 99807-1851 - Locação</p>
                <p>🕐 08hs às 18hs de segunda a sexta-feira</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">ENTRAMOS EM CONTATO</h3>
              <p className="mb-4">Ficou com dúvida de como alugar ou comprar o seu imóvel? Digite o seu email que entraremos em contato.</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Seu email..."
                  className="flex-1"
                />
                <Button className="bg-green-600 hover:bg-green-700">
                  ENVIAR
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>© 2025 Guerrinha Imóveis Ltda. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Floating Interest Summary */}
      {interestedProperties.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg">
          <p className="font-semibold">
            ❤️ {interestedProperties.length} {interestedProperties.length === 1 ? 'imóvel de interesse' : 'imóveis de interesse'}
          </p>
          <Button 
            className="mt-2 w-full bg-white text-green-600 hover:bg-gray-100"
            onClick={() => {
              alert(`Você tem interesse em ${interestedProperties.length} imóvel(is). Entraremos em contato!`);
            }}
          >
            Entrar em Contato
          </Button>
        </div>
      )}
    </div>
  );
}