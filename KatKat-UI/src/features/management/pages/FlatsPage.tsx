import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { Card } from '../../../components/Card';
import { EmptyState } from '../../../components/EmptyState';
import { ErrorBanner } from '../../../components/ErrorBanner';
import { Input } from '../../../components/Input';
import { Spinner } from '../../../components/Spinner';
import { useAsync } from '../../../hooks/useAsync';
import { ApiError } from '../../../services/api';
import type { UpdateResidentInfoDto } from '../../../types/building';
import { FlatMemberRoleLabels } from '../../../types/enums';
import { flatService } from '../services/flatService';
import { residentInvitationService } from '../services/residentInvitationService';

const EMPTY_RESIDENT_INFO_FORM: UpdateResidentInfoDto = { userName: '', email: '', phoneNumber: '' };

function FlatMembers({ flatId, refreshKey }: { flatId: string; refreshKey: number }) {
  const [localRefreshKey, setLocalRefreshKey] = useState(0);
  const { data: members, error, loading } = useAsync(
    () => flatService.listMembersByFlat(flatId),
    [flatId, refreshKey, localRefreshKey],
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [residentInfoForm, setResidentInfoForm] = useState<UpdateResidentInfoDto>(EMPTY_RESIDENT_INFO_FORM);
  const [residentInfoError, setResidentInfoError] = useState<string | null>(null);

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
      setLocalRefreshKey((k) => k + 1);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'İşlem başarısız.');
    }
  }

  async function handleRemove(memberId: string, memberName: string) {
    if (!window.confirm(`"${memberName}" adlı sakini bu daireden çıkarmak istediğinize emin misiniz?`)) return;
    await runAction(() => flatService.removeMember(memberId));
  }

  async function startEditResidentInfo(memberId: string) {
    setResidentInfoError(null);
    try {
      const info = await flatService.getResidentInfo(memberId);
      setResidentInfoForm(info);
      setEditingMemberId(memberId);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'Sakin bilgisi alınamadı.');
    }
  }

  async function handleSaveResidentInfo(event: FormEvent) {
    event.preventDefault();
    if (!editingMemberId) return;
    setResidentInfoError(null);
    try {
      await flatService.updateResidentInfo(editingMemberId, residentInfoForm);
      setEditingMemberId(null);
      setLocalRefreshKey((k) => k + 1);
    } catch (err) {
      setResidentInfoError(err instanceof ApiError ? err.message : 'Sakin bilgisi güncellenemedi.');
    }
  }

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!members || members.length === 0) return <EmptyState message="Bu dairede henüz sakin yok." />;

  return (
    <div className="stack">
      {actionError && <ErrorBanner message={actionError} />}
      {members.map((member) =>
        editingMemberId === member.id ? (
          <form key={member.id} className="stack" onSubmit={handleSaveResidentInfo}>
            {residentInfoError && <ErrorBanner message={residentInfoError} />}
            <div className="row">
              <Input
                placeholder="Kullanıcı Adı"
                value={residentInfoForm.userName}
                onChange={(e) => setResidentInfoForm({ ...residentInfoForm, userName: e.target.value })}
                required
              />
              <Input
                placeholder="E-posta"
                type="email"
                value={residentInfoForm.email}
                onChange={(e) => setResidentInfoForm({ ...residentInfoForm, email: e.target.value })}
                required
              />
              <Input
                placeholder="Telefon"
                value={residentInfoForm.phoneNumber}
                onChange={(e) => setResidentInfoForm({ ...residentInfoForm, phoneNumber: e.target.value })}
                required
              />
            </div>
            <div className="row">
              <Button type="submit">Kaydet</Button>
              <Button type="button" variant="secondary" onClick={() => setEditingMemberId(null)}>
                Vazgeç
              </Button>
            </div>
          </form>
        ) : (
          <div key={member.id} className="row">
            <Badge>{FlatMemberRoleLabels[member.role]}</Badge>
            <span>{member.userName}</span>
            {member.role === 0 && (
              <Button size="sm" variant="secondary" onClick={() => runAction(() => flatService.approve(member.id))}>
                Onayla
              </Button>
            )}
            {member.role === 1 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => runAction(() => flatService.promoteToManager(member.id))}
              >
                Yönetici Yap
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => startEditResidentInfo(member.id)}>
              Bilgilerini Düzenle
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleRemove(member.id, member.userName)}>
              Çıkar
            </Button>
          </div>
        ),
      )}
    </div>
  );
}

export function FlatsPage() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedFlatId, setExpandedFlatId] = useState<string | null>(null);
  const [editingFlatId, setEditingFlatId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ flatNumber: '', floorNumber: '', shareFactor: '1' });
  const [editError, setEditError] = useState<string | null>(null);
  const [inviteLinksByFlatId, setInviteLinksByFlatId] = useState<Record<string, string>>({});
  const [inviteErrorsByFlatId, setInviteErrorsByFlatId] = useState<Record<string, string>>({});

  const {
    data: flats,
    error,
    loading,
  } = useAsync(() => (buildingId ? flatService.listByBuilding(buildingId) : Promise.resolve([])), [
    buildingId,
    refreshKey,
  ]);

  const [flatNumber, setFlatNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('');
  const [shareFactor, setShareFactor] = useState('1');
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!buildingId) return;
    setCreateError(null);
    try {
      await flatService.create({
        buildingId,
        flatNumber,
        floorNumber: floorNumber ? Number(floorNumber) : undefined,
        shareFactor: Number(shareFactor),
      });
      setFlatNumber('');
      setFloorNumber('');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Daire oluşturulamadı.');
    }
  }

  async function handleJoin(flatId: string) {
    try {
      await flatService.invite({ flatId });
      setRefreshKey((k) => k + 1);
      setExpandedFlatId(flatId);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Katılım isteği gönderilemedi.');
    }
  }

  function startEdit(flat: { id: string; flatNumber: string; floorNumber?: number; shareFactor: number }) {
    setEditingFlatId(flat.id);
    setEditError(null);
    setEditForm({
      flatNumber: flat.flatNumber,
      floorNumber: flat.floorNumber != null ? String(flat.floorNumber) : '',
      shareFactor: String(flat.shareFactor),
    });
  }

  async function handleSaveEdit(event: FormEvent) {
    event.preventDefault();
    if (!editingFlatId) return;
    setEditError(null);
    try {
      await flatService.update(editingFlatId, {
        flatNumber: editForm.flatNumber,
        floorNumber: editForm.floorNumber ? Number(editForm.floorNumber) : undefined,
        shareFactor: Number(editForm.shareFactor),
      });
      setEditingFlatId(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : 'Daire güncellenemedi.');
    }
  }

  async function handleDelete(flatId: string, flatNumberLabel: string) {
    if (!window.confirm(`"${flatNumberLabel}" numaralı daireyi silmek istediğinize emin misiniz?`)) return;
    try {
      await flatService.delete(flatId);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      window.alert(err instanceof ApiError ? err.message : 'Daire silinemedi.');
    }
  }

  async function handleCreateInvite(flatId: string) {
    setInviteErrorsByFlatId((prev) => ({ ...prev, [flatId]: '' }));
    try {
      const invitation = await residentInvitationService.create({ flatId });
      const link = `${window.location.origin}/invite/${invitation.code}`;
      setInviteLinksByFlatId((prev) => ({ ...prev, [flatId]: link }));
    } catch (err) {
      setInviteErrorsByFlatId((prev) => ({
        ...prev,
        [flatId]: err instanceof ApiError ? err.message : 'Davet oluşturulamadı.',
      }));
    }
  }

  return (
    <div className="page stack">
      <div className="page-header">
        <h1>Daireler</h1>
      </div>

      <Card className="stack">
        <h2>Yeni Daire Ekle</h2>
        <form className="row" onSubmit={handleCreate}>
          {createError && <ErrorBanner message={createError} />}
          <Input placeholder="Daire No" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} required />
          <Input placeholder="Kat" type="number" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
          <Input
            placeholder="Arsa Payı"
            type="number"
            step="any"
            value={shareFactor}
            onChange={(e) => setShareFactor(e.target.value)}
            required
          />
          <Button type="submit">Ekle</Button>
        </form>
      </Card>

      {loading && <Spinner />}
      {error && <ErrorBanner message={error} />}
      {flats && flats.length === 0 && <EmptyState message="Bu blokta henüz daire yok." />}
      <div className="stack">
        {flats?.map((flat) => (
          <Card key={flat.id} className="stack">
            {editingFlatId === flat.id ? (
              <form className="stack" onSubmit={handleSaveEdit}>
                {editError && <ErrorBanner message={editError} />}
                <div className="row">
                  <Input
                    placeholder="Daire No"
                    value={editForm.flatNumber}
                    onChange={(e) => setEditForm({ ...editForm, flatNumber: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Kat"
                    type="number"
                    value={editForm.floorNumber}
                    onChange={(e) => setEditForm({ ...editForm, floorNumber: e.target.value })}
                  />
                  <Input
                    placeholder="Arsa Payı"
                    type="number"
                    step="any"
                    value={editForm.shareFactor}
                    onChange={(e) => setEditForm({ ...editForm, shareFactor: e.target.value })}
                    required
                  />
                </div>
                <div className="row">
                  <Button type="submit">Kaydet</Button>
                  <Button type="button" variant="secondary" onClick={() => setEditingFlatId(null)}>
                    Vazgeç
                  </Button>
                </div>
              </form>
            ) : (
              <div className="page-header">
                <div>
                  <strong>Daire {flat.flatNumber}</strong>
                  {flat.floorNumber != null && <span> — Kat {flat.floorNumber}</span>}
                </div>
                <div className="row">
                  <Button size="sm" variant="secondary" onClick={() => handleCreateInvite(flat.id)}>
                    Sakin Davet Et
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleJoin(flat.id)}>
                    Bu Daireye Katıl
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setExpandedFlatId(expandedFlatId === flat.id ? null : flat.id)}
                  >
                    {expandedFlatId === flat.id ? 'Gizle' : 'Sakinleri Gör'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(flat)}>
                    Düzenle
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(flat.id, flat.flatNumber)}>
                    Sil
                  </Button>
                </div>
              </div>
            )}
            {inviteErrorsByFlatId[flat.id] && <ErrorBanner message={inviteErrorsByFlatId[flat.id]} />}
            {inviteLinksByFlatId[flat.id] && (
              <div className="row">
                <Input value={inviteLinksByFlatId[flat.id]} readOnly onFocus={(e) => e.target.select()} />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(inviteLinksByFlatId[flat.id])}
                >
                  Kopyala
                </Button>
              </div>
            )}
            {expandedFlatId === flat.id && <FlatMembers flatId={flat.id} refreshKey={refreshKey} />}
          </Card>
        ))}
      </div>
    </div>
  );
}
