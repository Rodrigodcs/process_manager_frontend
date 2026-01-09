'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { authService } from '@/services/auth';
import { SignUpDto } from '@/types';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { IconType } from 'react-icons';
import {
  FiAward,
  FiCode,
  FiCoffee,
  FiCommand,
  FiCpu,
  FiHeart,
  FiSmile,
  FiStar,
  FiTarget,
  FiTrendingUp,
  FiUser,
  FiZap,
} from 'react-icons/fi';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Laranja', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
];

const ICONS: { name: string; value: string; icon: IconType }[] = [
  { name: 'Usuário', value: 'FiUser', icon: FiUser },
  { name: 'Estrela', value: 'FiStar', icon: FiStar },
  { name: 'Coração', value: 'FiHeart', icon: FiHeart },
  { name: 'Sorriso', value: 'FiSmile', icon: FiSmile },
  { name: 'Raio', value: 'FiZap', icon: FiZap },
  { name: 'Café', value: 'FiCoffee', icon: FiCoffee },
  { name: 'Crescimento', value: 'FiTrendingUp', icon: FiTrendingUp },
  { name: 'Alvo', value: 'FiTarget', icon: FiTarget },
  { name: 'Troféu', value: 'FiAward', icon: FiAward },
  { name: 'Código', value: 'FiCode', icon: FiCode },
  { name: 'Comando', value: 'FiCommand', icon: FiCommand },
  { name: 'Chip', value: 'FiCpu', icon: FiCpu },
];

export default function SignUpModal({ isOpen, onClose, onSuccess }: SignUpModalProps) {
  const [formData, setFormData] = useState<SignUpDto>({
    name: '',
    email: '',
    password: '',
    color: COLORS[0].value,
    icon: ICONS[0].value,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpDto, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof SignUpDto, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await authService.signUp(formData);
      toast.success('Conta criada com sucesso! Faça login para continuar.');
      onSuccess();
      onClose();

      setFormData({
        name: '',
        email: '',
        password: '',
        color: COLORS[0].value,
        icon: ICONS[0].value,
      });
      setErrors({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Conta" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          required
          placeholder="Seu nome completo"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          required
          placeholder="seu@email.com"
        />

        <Input
          label="Senha"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          error={errors.password}
          required
          placeholder="Mínimo 6 caracteres"
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cor do Perfil
          </label>
          <div className="flex gap-3 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: color.value })}
                className={`w-10 h-10 rounded-full transition-all ${formData.color === color.value
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110'
                  : 'hover:scale-105'
                  }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ícone do Perfil
          </label>
          <div className="grid grid-cols-6 gap-3">
            {ICONS.map((iconItem) => {
              const Icon = iconItem.icon;
              return (
                <button
                  key={iconItem.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconItem.value })}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${formData.icon === iconItem.value
                    ? 'bg-gray-600 ring-2 ring-white scale-110'
                    : 'bg-gray-700 hover:bg-gray-600 hover:scale-105'
                    }`}
                  title={iconItem.name}
                >
                  <Icon className="w-6 h-6 text-gray-100" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" isLoading={isLoading}>
            Criar Conta
          </Button>
        </div>
      </form>
    </Modal>
  );
}

