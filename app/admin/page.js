'use client'
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminPage() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'casa',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    featured: false,
    qty: 1
  })

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
      } else {
        setProperties(data || [])
      }
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.name || !formData.price || !formData.location || !formData.bedrooms || !formData.bathrooms || !formData.area) {
      alert('Por favor, preencha todos os campos obrigatórios.')
      return
    }
    
    const propertyData = {
      name: formData.name.trim(),
      type: formData.type,
      price: parseFloat(formData.price) || 0,
      location: formData.location.trim(),
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseInt(formData.bathrooms) || 0,
      area: parseInt(formData.area) || 0,
      description: formData.description.trim(),
      featured: Boolean(formData.featured),
      qty: parseInt(formData.qty) || 1,
      barcode: Math.random().toString(36).substr(2, 12),
      lote: new Date().toISOString(),
      update: new Date().toISOString()
    }

    try {
      let result
      if (editingProperty) {
        // Update existing property
        result = await supabase
          .from('stoq')
          .update(propertyData)
          .eq('id', editingProperty.id)
          .select()
      } else {
        // Create new property
        result = await supabase
          .from('stoq')
          .insert([propertyData])
          .select()
      }

      if (result.error) {
        console.error('Erro detalhado ao salvar imóvel:', result.error)
        alert(`Erro ao salvar imóvel: ${result.error.message || 'Erro desconhecido'}`)
      } else {
        alert(editingProperty ? 'Imóvel atualizado com sucesso!' : 'Imóvel adicionado com sucesso!')
        setShowForm(false)
        setEditingProperty(null)
        setFormData({
          name: '',
          type: 'casa',
          price: '',
          location: '',
          bedrooms: '',
          bathrooms: '',
          area: '',
          description: '',
          featured: false,
          qty: 1
        })
        fetchProperties()
      }
    } catch (error) {
      console.error('Erro de exceção:', error)
      alert(`Erro ao salvar imóvel: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const handleEdit = (property) => {
    setEditingProperty(property)
    setFormData({
      name: property.name,
      type: property.type,
      price: property.price.toString(),
      location: property.location,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      area: property.area.toString(),
      description: property.description,
      featured: property.featured || false,
      qty: property.qty?.toString() || '1'
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        const { error } = await supabase
          .from('stoq')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Erro ao deletar imóvel:', error)
          alert('Erro ao deletar imóvel')
        } else {
          alert('Imóvel deletado com sucesso!')
          fetchProperties()
        }
      } catch (error) {
        console.error('Erro:', error)
        alert('Erro ao deletar imóvel')
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProperty(null)
    setFormData({
      name: '',
      type: 'casa',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      description: '',
      featured: false,
      qty: 1
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">🏠 Admin - Guerrinha Imóveis</h1>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                ➕ Adicionar Imóvel
              </Button>
              <Button 
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 hover:bg-gray-700"
              >
                🏠 Ver Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingProperty ? 'Editar Imóvel' : 'Adicionar Novo Imóvel'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome do Imóvel</label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ex: Casa em Condomínio Fechado"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="casa">Casa</option>
                      <option value="apartamento">Apartamento</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Preço (R$)</label>
                    <Input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="850000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Localização</label>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Cidade Nobre, Ipatinga/MG"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quartos</label>
                    <Input
                      name="bedrooms"
                      type="number"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      placeholder="3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Banheiros</label>
                    <Input
                      name="bathrooms"
                      type="number"
                      value={formData.bathrooms}
                      onChange={handleInputChange}
                      placeholder="2"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Área (m²)</label>
                    <Input
                      name="area"
                      type="number"
                      value={formData.area}
                      onChange={handleInputChange}
                      placeholder="120"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Descrição detalhada do imóvel..."
                    className="w-full px-3 py-2 border rounded-lg h-24"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantidade</label>
                    <Input
                      name="qty"
                      type="number"
                      value={formData.qty}
                      onChange={handleInputChange}
                      placeholder="1"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium">Imóvel em Destaque</label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingProperty ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Properties List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Imóveis Cadastrados ({properties.length})</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p>Carregando imóveis...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🏠</div>
              <p className="text-gray-600">Nenhum imóvel cadastrado ainda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preço</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localização</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quartos</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Área</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">#{property.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{property.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.type === 'casa' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {property.type === 'casa' ? '🏠 Casa' : '🏢 Apartamento'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        R$ {property.price?.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{property.location}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{property.bedrooms}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{property.area}m²</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.featured ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {property.featured ? '⭐ Destaque' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button
                          onClick={() => handleEdit(property)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-xs"
                        >
                          ✏️ Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(property.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-xs"
                        >
                          🗑️ Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}